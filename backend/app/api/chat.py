import json
import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.database.models import User, Paper, Conversation, Message
from app.schemas.schemas import ChatMessageCreate, MessageResponse, ConversationResponse, MultiPaperChatRequest, ChunkSource
from app.security.auth import get_current_user
from app.rag.retriever import retriever
from app.ai.llm_provider import llm

router = APIRouter(prefix="/chat", tags=["Research Q&A / Chat"])

@router.post("/paper/{paper_id}", response_model=MessageResponse)
async def chat_with_paper(
    paper_id: str,
    req: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Paper).where(Paper.id == paper_id, Paper.user_id == current_user.id)
    res = await db.execute(stmt)
    paper = res.scalar_one_or_none()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")

    # Retrieve grounded chunks
    retrieval_res = retriever.retrieve_context(
        query=req.question,
        paper_ids=[paper.id],
        paper_titles={paper.id: paper.title},
        top_k=4
    )

    sources = retrieval_res["sources"]
    context_text = retrieval_res["context_text"]

    system_prompt = (
        "You are an AI Research Assistant specialized in deep academic comprehension. "
        "Strictly adhere to the NO-HALLUCINATION rule: answer ONLY using the provided retrieved context from the paper. "
        "Cite the section and page numbers when mentioning specific findings. "
        "If the context does not contain sufficient evidence to answer, respond exactly: "
        "'I couldn't find sufficient evidence for this in the uploaded paper.'"
    )

    user_prompt = f"Context from Paper '{paper.title}':\n{context_text}\n\nUser Question: {req.question}"
    answer_text = await llm.generate_response(prompt=user_prompt, system_prompt=system_prompt)

    # Save to conversation history if desired
    conv_id = req.conversation_id
    if not conv_id:
        new_conv = Conversation(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            paper_id=paper.id,
            title=f"Chat: {paper.title[:40]}...",
            is_multi_paper=False
        )
        db.add(new_conv)
        await db.flush()
        conv_id = new_conv.id

    msg_id = str(uuid.uuid4())
    msg_rec = Message(
        id=msg_id,
        conversation_id=conv_id,
        role="assistant",
        content=answer_text,
        sources_json=json.dumps([s.dict() for s in sources])
    )
    db.add(msg_rec)
    await db.commit()

    return MessageResponse(
        id=msg_id,
        role="assistant",
        content=answer_text,
        sources=sources,
        created_at=datetime.datetime.utcnow()
    )


@router.post("/multi-paper", response_model=MessageResponse)
async def chat_multi_paper(
    req: MultiPaperChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not req.paper_ids:
        raise HTTPException(status_code=400, detail="At least one paper ID must be provided.")

    stmt = select(Paper).where(Paper.id.in_(req.paper_ids), Paper.user_id == current_user.id)
    res = await db.execute(stmt)
    papers = res.scalars().all()
    if not papers:
        raise HTTPException(status_code=404, detail="No matching papers found.")

    paper_titles = {p.id: p.title for p in papers}

    retrieval_res = retriever.retrieve_context(
        query=req.question,
        paper_ids=[p.id for p in papers],
        paper_titles=paper_titles,
        top_k=6
    )

    sources = retrieval_res["sources"]
    context_text = retrieval_res["context_text"]

    system_prompt = (
        "You are an AI Research Assistant synthesizing insights across multiple research papers. "
        "Compare, contrast, and cite findings directly by paper title, section, and page number. "
        "Strictly ground all conclusions in the provided excerpts. Do not speculate."
    )

    user_prompt = f"Retrieved Cross-Paper Evidence:\n{context_text}\n\nUser Question: {req.question}"
    answer_text = await llm.generate_response(prompt=user_prompt, system_prompt=system_prompt)

    msg_id = str(uuid.uuid4())
    return MessageResponse(
        id=msg_id,
        role="assistant",
        content=answer_text,
        sources=sources,
        created_at=datetime.datetime.utcnow()
    )
