import json
import uuid
import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.database.models import User, Paper, ResearchGapAnalysis
from app.schemas.schemas import ResearchGapRequest, ResearchGapResponse, ResearchGapItem
from app.security.auth import get_current_user
from app.ai.gap_detector import gap_detector

router = APIRouter(prefix="/research-gap", tags=["Research Gap Detector"])

@router.post("/analyze", response_model=ResearchGapResponse)
async def analyze_research_gaps(
    req: ResearchGapRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not req.paper_ids:
        raise HTTPException(status_code=400, detail="Please select at least 1 paper for research gap analysis.")

    stmt = select(Paper).where(Paper.id.in_(req.paper_ids), Paper.user_id == current_user.id)
    res = await db.execute(stmt)
    papers = res.scalars().all()

    if not papers:
        raise HTTPException(status_code=404, detail="No matching papers found.")

    papers_data = [
        {"id": p.id, "title": p.title, "abstract": p.abstract or "", "full_text": p.abstract or ""}
        for p in papers
    ]

    analysis = gap_detector.analyze_gaps(papers_data=papers_data, focus_topic=req.focus_topic)

    # Save to database
    db_rec = ResearchGapAnalysis(
        id=analysis["id"],
        user_id=current_user.id,
        title=analysis["title"],
        paper_ids_json=json.dumps(analysis["paper_ids"]),
        gaps_json=json.dumps(analysis["gaps"]),
        synthesis_markdown=analysis["synthesis_markdown"]
    )
    db.add(db_rec)
    await db.commit()

    return ResearchGapResponse(
        id=analysis["id"],
        title=analysis["title"],
        paper_ids=analysis["paper_ids"],
        gaps=[ResearchGapItem(**g) for g in analysis["gaps"]],
        synthesis_markdown=analysis["synthesis_markdown"],
        recommended_next_steps=analysis["recommended_next_steps"],
        created_at=datetime.datetime.utcnow()
    )


@router.get("", response_model=List[ResearchGapResponse])
async def list_gap_analyses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(ResearchGapAnalysis)
        .where(ResearchGapAnalysis.user_id == current_user.id)
        .order_by(ResearchGapAnalysis.created_at.desc())
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
            raw_gaps = json.loads(r.gaps_json)
        except Exception:
            raw_gaps = []

        gaps = [ResearchGapItem(**g) for g in raw_gaps]
        results.append(ResearchGapResponse(
            id=r.id,
            title=r.title,
            paper_ids=p_ids,
            gaps=gaps,
            synthesis_markdown=r.synthesis_markdown,
            recommended_next_steps=[
                "Formulate an ablation experiment isolating the identified bottleneck.",
                "Collect an out-of-distribution evaluation benchmark."
            ],
            created_at=r.created_at
        ))

    return results
