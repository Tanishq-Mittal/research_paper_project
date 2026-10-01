import json
import uuid
import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.database.models import User, Paper, LiteratureReview
from app.schemas.schemas import LiteratureReviewRequest, LiteratureReviewResponse
from app.security.auth import get_current_user
from app.ai.review_generator import review_generator

router = APIRouter(prefix="/literature-review", tags=["Literature Review"])

@router.post("/generate", response_model=LiteratureReviewResponse)
async def generate_literature_review(
    req: LiteratureReviewRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not req.paper_ids:
        raise HTTPException(status_code=400, detail="Please select at least 1 paper to generate a literature review.")

    stmt = (
        select(Paper)
        .where(Paper.id.in_(req.paper_ids), Paper.user_id == current_user.id)
        .options(selectinload(Paper.authors))
    )
    res = await db.execute(stmt)
    papers = res.scalars().all()

    if not papers:
        raise HTTPException(status_code=404, detail="No matching papers found.")

    papers_data = []
    for p in papers:
        authors = [{"name": a.name} for a in p.authors] if p.authors else [{"name": "Lead Researcher"}]
        papers_data.append({
            "id": p.id,
            "title": p.title,
            "abstract": p.abstract or "",
            "publication_year": p.publication_year or 2023,
            "journal_venue": p.journal_venue or "Academic Conference",
            "doi": p.doi or "",
            "authors": authors
        })

    review_res = review_generator.generate_review(
        papers_data=papers_data,
        topic=req.topic,
        custom_instructions=req.custom_instructions
    )

    # Save to database
    db_rec = LiteratureReview(
        id=review_res["id"],
        user_id=current_user.id,
        title=review_res["title"],
        topic=review_res["topic"],
        paper_ids_json=json.dumps(review_res["paper_ids"]),
        content_markdown=review_res["content_markdown"],
        structured_json=json.dumps(review_res["structured_sections"])
    )
    db.add(db_rec)
    await db.commit()

    return review_res


@router.get("", response_model=List[LiteratureReviewResponse])
async def list_literature_reviews(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(LiteratureReview)
        .where(LiteratureReview.user_id == current_user.id)
        .order_by(LiteratureReview.created_at.desc())
    )
    res = await db.execute(stmt)
    records = res.scalars().all()

    results = []
    for r in records:
        try:
            p_ids = json.loads(r.paper_ids_json)
        except Exception:
            p_ids = []
            
        try:
            sec_data = json.loads(r.structured_json)
        except Exception:
            sec_data = {}

        refs = sec_data.get("References", [])
        results.append(LiteratureReviewResponse(
            id=r.id,
            title=r.title,
            topic=r.topic,
            paper_ids=p_ids,
            content_markdown=r.content_markdown,
            structured_sections=sec_data,
            formatted_references=refs,
            created_at=r.created_at
        ))

    return results
