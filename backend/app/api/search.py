import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.database.models import User, Paper
from app.schemas.schemas import SearchResultItem
from app.security.auth import get_current_user
from app.services.semantic_scholar import semantic_scholar
from app.rag.embeddings import embedding_engine

router = APIRouter(prefix="/search", tags=["Search & Discovery"])

@router.get("", response_model=List[SearchResultItem])
async def search_papers(
    query: str = Query(..., min_length=2),
    year_min: Optional[int] = None,
    year_max: Optional[int] = None,
    source: str = "all", # library, external, all
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    results: List[SearchResultItem] = []
    seen_titles = set()

    # 1. Search in user's library
    if source in ["library", "all"]:
        stmt = (
            select(Paper)
            .where(Paper.user_id == current_user.id)
            .options(selectinload(Paper.authors))
        )
        res = await db.execute(stmt)
        library_papers = res.scalars().all()

        q_terms = [w.lower() for w in query.split() if len(w) > 2]

        for p in library_papers:
            if year_min and p.publication_year and p.publication_year < year_min:
                continue
            if year_max and p.publication_year and p.publication_year > year_max:
                continue

            authors = [a.name for a in p.authors] if p.authors else []
            match_score = 0.0
            full_corpus = (p.title + " " + (p.abstract or "") + " " + " ".join(authors)).lower()

            for t in q_terms:
                if t in full_corpus:
                    match_score += 1.0

            if match_score > 0 or not q_terms:
                sim = min(0.99, 0.6 + (match_score / max(1, len(q_terms))) * 0.39)
                seen_titles.add(p.title.lower().strip())
                results.append(SearchResultItem(
                    id=p.id,
                    title=p.title,
                    authors=authors,
                    abstract=p.abstract or "Indexed in library.",
                    year=p.publication_year,
                    venue=p.journal_venue,
                    citation_count=p.citation_count or 0,
                    url=p.url,
                    doi=p.doi,
                    is_in_library=True,
                    similarity_score=round(sim, 3)
                ))

    # 2. Search external / Semantic Scholar
    if source in ["external", "all"]:
        external_results = await semantic_scholar.search_papers(query=query, limit=8)
        for ep in external_results:
            if ep["title"].lower().strip() not in seen_titles:
                results.append(SearchResultItem(
                    id=ep["id"],
                    title=ep["title"],
                    authors=ep["authors"],
                    abstract=ep["abstract"],
                    year=ep["year"],
                    venue=ep["venue"],
                    citation_count=ep["citation_count"],
                    url=ep["url"],
                    doi=ep["doi"],
                    is_in_library=False,
                    similarity_score=ep.get("similarity_score", 0.85)
                ))

    # Sort results by similarity score
    results.sort(key=lambda x: (x.similarity_score, x.citation_count), reverse=True)
    return results


@router.get("/related/{paper_id}", response_model=List[SearchResultItem])
async def get_related_papers(
    paper_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Paper).where(Paper.id == paper_id, Paper.user_id == current_user.id)
    res = await db.execute(stmt)
    paper = res.scalar_one_or_none()
    
    query = paper.title if paper else "transformer deep learning attention"
    return await search_papers(query=query, source="all", current_user=current_user, db=db)
