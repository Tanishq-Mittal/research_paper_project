from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.database.models import User, Paper
from app.schemas.schemas import CitationGenerateRequest, CitationFormatResponse
from app.security.auth import get_current_user
from app.ai.citation_formatter import citation_formatter

router = APIRouter(prefix="/citations", tags=["Citations"])

@router.post("/generate", response_model=List[CitationFormatResponse])
async def generate_citations(
    req: CitationGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not req.paper_ids:
        raise HTTPException(status_code=400, detail="Please select at least 1 paper.")

    stmt = select(Paper).where(Paper.id.in_(req.paper_ids), Paper.user_id == current_user.id).options(selectinload(Paper.authors))
    res = await db.execute(stmt)
    papers = res.scalars().all()

    if not papers:
        raise HTTPException(status_code=404, detail="No matching papers found.")

    results: List[CitationFormatResponse] = []
    for p in papers:
        authors = [{"name": a.name} for a in p.authors] if p.authors else [{"name": "Lead Researcher"}]
        paper_dict = {
            "title": p.title,
            "publication_year": p.publication_year,
            "journal_venue": p.journal_venue,
            "doi": p.doi,
            "url": p.url,
            "authors": authors
        }
        citations_dict = citation_formatter.format_citations(paper_dict)
        results.append(CitationFormatResponse(
            paper_id=p.id,
            paper_title=p.title,
            citations=citations_dict
        ))

    return results
