from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.database.models import User, Paper
from app.schemas.schemas import (
    IdeaGenerateRequest, IdeaResponse, ResearchIdeaItem,
    QuestionGenerateRequest, QuestionsResponse, QuestionItem
)
from app.security.auth import get_current_user
from app.ai.idea_generator import idea_generator

router = APIRouter(prefix="/ideas", tags=["Research Ideas & Hypotheses"])

@router.post("/generate", response_model=IdeaResponse)
async def generate_research_ideas(
    req: IdeaGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not req.paper_ids:
        raise HTTPException(status_code=400, detail="Please select at least 1 paper to brainstorm research ideas.")

    stmt = select(Paper).where(Paper.id.in_(req.paper_ids), Paper.user_id == current_user.id)
    res = await db.execute(stmt)
    papers = res.scalars().all()

    if not papers:
        raise HTTPException(status_code=404, detail="No matching papers found.")

    papers_data = [{"id": p.id, "title": p.title} for p in papers]
    ideas_res = idea_generator.generate_ideas(papers_data=papers_data, interest_area=req.interest_area)

    return IdeaResponse(
        ideas=[ResearchIdeaItem(**i) for i in ideas_res["ideas"]],
        methodology_framework=ideas_res["methodology_framework"]
    )


@router.post("/questions", response_model=QuestionsResponse)
async def generate_research_questions(
    req: QuestionGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Paper).where(Paper.id.in_(req.paper_ids), Paper.user_id == current_user.id)
    res = await db.execute(stmt)
    papers = res.scalars().all()

    papers_data = [{"id": p.id, "title": p.title} for p in papers]
    questions_data = idea_generator.generate_questions(papers_data=papers_data)

    return QuestionsResponse(
        questions=[QuestionItem(**q) for q in questions_data]
    )
