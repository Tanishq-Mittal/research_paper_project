import os
import json
import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.database.models import User, Paper, PaperAuthor, PaperChunk, CollectionPaper
from app.schemas.schemas import (
    PaperResponse, PaperUpdate, PaperAuthorResponse,
    StructuredDigest, SimplifyRequest, SimplifyResponse, PaperChunkResponse
)
from app.security.auth import get_current_user
from app.config import settings
from app.services.pdf_processor import PDFProcessor
from app.rag.chunker import chunker
from app.rag.embeddings import embedding_engine
from app.rag.vector_store import vector_store
from app.ai.digest_generator import digest_generator
from app.ai.simplifier import simplifier

router = APIRouter(prefix="/papers", tags=["Research Papers"])

def format_paper_response(p: Paper) -> dict:
    authors = []
    if p.authors:
        for a in p.authors:
            authors.append(PaperAuthorResponse(name=a.name, affiliation=a.affiliation, order_idx=a.order_idx))
            
    keywords = []
    if p.keywords_json:
        try:
            keywords = json.loads(p.keywords_json)
        except Exception:
            keywords = []
            
    scorecard = {}
    if p.scorecard_json:
        try:
            scorecard = json.loads(p.scorecard_json)
        except Exception:
            pass

    digest = {}
    if p.digest_json:
        try:
            digest = json.loads(p.digest_json)
        except Exception:
            pass

    return {
        "id": p.id,
        "user_id": p.user_id,
        "title": p.title,
        "original_filename": p.original_filename,
        "file_path": p.file_path,
        "file_size": p.file_size,
        "page_count": p.page_count,
        "abstract": p.abstract,
        "publication_year": p.publication_year,
        "journal_venue": p.journal_venue,
        "doi": p.doi,
        "url": p.url,
        "citation_count": p.citation_count,
        "keywords": keywords,
        "scorecard": scorecard,
        "digest": digest,
        "reading_status": p.reading_status or "Not Started",
        "reading_progress": p.reading_progress or 0,
        "is_favorite": p.is_favorite or False,
        "is_demo": p.is_demo or False,
        "authors": authors,
        "created_at": p.created_at,
        "updated_at": p.updated_at
    }


@router.get("", response_model=List[PaperResponse])
async def list_papers(
    reading_status: Optional[str] = None,
    is_favorite: Optional[bool] = None,
    collection_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Paper)
        .where((Paper.user_id == current_user.id) | (Paper.is_demo == True))
        .options(selectinload(Paper.authors))
        .order_by(Paper.created_at.desc())
    )
    
    if is_favorite is not None:
        stmt = stmt.where(Paper.is_favorite == is_favorite)
    if reading_status:
        stmt = stmt.where(Paper.reading_status == reading_status)

    res = await db.execute(stmt)
    papers = res.scalars().all()

    # Filter by collection if specified
    if collection_id:
        link_stmt = select(CollectionPaper.paper_id).where(CollectionPaper.collection_id == collection_id)
        l_res = await db.execute(link_stmt)
        c_paper_ids = set(l_res.scalars().all())
        papers = [p for p in papers if p.id in c_paper_ids]

    return [format_paper_response(p) for p in papers]


@router.post("/upload")
async def upload_paper(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not file.filename.lower().endswith(tuple(settings.ALLOWED_EXTENSIONS)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a PDF, TXT, or Markdown paper."
        )

    file_id = str(uuid.uuid4())
    saved_filename = f"{file_id}_{file.filename}"
    saved_path = os.path.join(settings.UPLOAD_DIR, saved_filename)

    content = await file.read()
    file_size = len(content)

    if file_size > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    with open(saved_path, "wb") as f:
        f.write(content)

    processing_steps = [
        "✓ File received and saved securely",
        "● Extracting layout and text content via PyMuPDF...",
    ]

    try:
        # Extract PDF content
        extracted = PDFProcessor.extract_from_path(saved_path)
        processing_steps.append("✓ Text extracted and cleaned")
        processing_steps.append(f"✓ Detected {len(extracted['sections'])} academic sections across {extracted['page_count']} pages")

        paper_title = title or extracted.get("title") or file.filename.rsplit(".", 1)[0]
        abstract = extracted.get("abstract", "")
        doi = extracted.get("doi")
        page_count = extracted.get("page_count", 1)

        # Generate structured digest
        processing_steps.append("● Generating structured digest and scorecard...")
        digest = await digest_generator.generate_digest(
            title=paper_title,
            abstract=abstract,
            sections=extracted.get("sections", {}),
            full_text=extracted.get("full_text", "")
        )
        processing_steps.append("✓ Structured digest generated")

        # Create Paper in Database
        keywords = digest.get("algorithms_and_models", [])[:5] + ["Research"]
        scorecard = {
            "citation_count": 0,
            "publication_year": datetime.date.today().year,
            "dataset_reported": bool(digest.get("dataset_details", {}).get("name") != "Not explicitly reported in the paper."),
            "dataset_name": digest.get("dataset_details", {}).get("name"),
            "experiments_count": len(digest.get("methodology_steps", [])) or 1,
            "metrics_reported": list(digest.get("results_and_metrics", {}).keys()),
            "is_open_access": True,
            "references_count": len(extracted.get("sections", {}).get("References", {}).get("content", "").split("\n")) if "References" in extracted.get("sections", {}) else 15
        }

        new_paper = Paper(
            id=file_id,
            user_id=current_user.id,
            title=paper_title,
            original_filename=file.filename,
            file_path=saved_path,
            file_size=file_size,
            page_count=page_count,
            abstract=abstract,
            publication_year=datetime.date.today().year,
            journal_venue="Uploaded Manuscript / Preprint",
            doi=doi,
            citation_count=0,
            keywords_json=json.dumps(keywords),
            scorecard_json=json.dumps(scorecard),
            digest_json=json.dumps(digest),
            reading_status="Started",
            reading_progress=25,
            is_favorite=False,
            is_demo=False
        )
        db.add(new_paper)
        await db.flush()

        # Add author
        auth = PaperAuthor(paper_id=new_paper.id, name="Lead Author", order_idx=0)
        db.add(auth)

        # Generate Chunks & Embeddings
        processing_steps.append("● Segmenting text and generating vector embeddings...")
        chunks_data = chunker.chunk_paper(
            paper_id=new_paper.id,
            pages=extracted.get("pages", []),
            sections=extracted.get("sections", {})
        )

        chunk_texts = [c["content"] for c in chunks_data]
        embeddings = embedding_engine.embed_texts(chunk_texts)
        vector_store.add_chunks(new_paper.id, chunks_data, embeddings)

        for c in chunks_data:
            chunk_rec = PaperChunk(
                id=c["id"],
                paper_id=new_paper.id,
                chunk_index=c["chunk_index"],
                section_name=c["section_name"],
                page_number=c["page_number"],
                content=c["content"],
                token_count=c["token_count"]
            )
            db.add(chunk_rec)

        processing_steps.append(f"✓ Indexed {len(chunks_data)} semantic chunks into vector store")
        processing_steps.append("✓ Ready to analyze and query")

        await db.commit()
        await db.refresh(new_paper)

        # Reload with authors
        stmt = select(Paper).where(Paper.id == new_paper.id).options(selectinload(Paper.authors))
        re_res = await db.execute(stmt)
        full_paper = re_res.scalar_one()

        return {
            "message": "Paper successfully parsed, indexed, and analyzed.",
            "paper": format_paper_response(full_paper),
            "processing_steps": processing_steps
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Couldn't extract text from this PDF. {str(e)}. Try an OCR-enabled PDF."
        )


@router.get("/{paper_id}", response_model=PaperResponse)
async def get_paper(
    paper_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Paper)
        .where(Paper.id == paper_id, Paper.user_id == current_user.id)
        .options(selectinload(Paper.authors))
    )
    res = await db.execute(stmt)
    paper = res.scalar_one_or_none()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")
    return format_paper_response(paper)


@router.patch("/{paper_id}", response_model=PaperResponse)
async def update_paper(
    paper_id: str,
    updates: PaperUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Paper)
        .where(Paper.id == paper_id, Paper.user_id == current_user.id)
        .options(selectinload(Paper.authors))
    )
    res = await db.execute(stmt)
    paper = res.scalar_one_or_none()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")

    if updates.reading_status is not None:
        paper.reading_status = updates.reading_status
    if updates.reading_progress is not None:
        paper.reading_progress = updates.reading_progress
    if updates.is_favorite is not None:
        paper.is_favorite = updates.is_favorite
    if updates.title is not None:
        paper.title = updates.title

    paper.updated_at = datetime.datetime.utcnow()
    await db.commit()
    await db.refresh(paper)
    return format_paper_response(paper)


@router.delete("/{paper_id}")
async def delete_paper(
    paper_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Paper).where(Paper.id == paper_id, Paper.user_id == current_user.id)
    res = await db.execute(stmt)
    paper = res.scalar_one_or_none()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")

    vector_store.remove_paper(paper_id)
    if paper.file_path and os.path.exists(paper.file_path) and not paper.is_demo:
        try:
            os.remove(paper.file_path)
        except Exception:
            pass

    await db.delete(paper)
    await db.commit()
    return {"message": "Paper successfully removed from workspace."}


@router.post("/{paper_id}/simplify", response_model=SimplifyResponse)
async def simplify_paper_content(
    paper_id: str,
    req: SimplifyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Paper).where(Paper.id == paper_id, Paper.user_id == current_user.id)
    res = await db.execute(stmt)
    paper = res.scalar_one_or_none()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")

    content = req.selected_text or paper.abstract or paper.title
    result = await simplifier.simplify_text(text=content, level=req.level, concept=req.concept)
    return result


@router.get("/{paper_id}/chunks", response_model=List[PaperChunkResponse])
async def get_paper_chunks(
    paper_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(PaperChunk)
        .where(PaperChunk.paper_id == paper_id)
        .order_by(PaperChunk.chunk_index.asc())
    )
    res = await db.execute(stmt)
    return res.scalars().all()
