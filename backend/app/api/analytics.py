from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database.session import get_db
from app.database.models import User, Paper, Note, Collection, LiteratureReview
from app.schemas.schemas import AnalyticsResponse
from app.security.auth import get_current_user
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics & Visualizations"])

@router.get("", response_model=AnalyticsResponse)
async def get_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch all user papers
    stmt_papers = select(Paper).where(Paper.user_id == current_user.id)
    p_res = await db.execute(stmt_papers)
    papers = p_res.scalars().all()

    # Counts for notes, collections, reviews
    stmt_notes = select(func.count(Note.id)).where(Note.user_id == current_user.id)
    n_res = await db.execute(stmt_notes)
    notes_count = n_res.scalar() or 0

    stmt_col = select(func.count(Collection.id)).where(Collection.user_id == current_user.id)
    c_res = await db.execute(stmt_col)
    col_count = c_res.scalar() or 0

    stmt_rev = select(func.count(LiteratureReview.id)).where(LiteratureReview.user_id == current_user.id)
    r_res = await db.execute(stmt_rev)
    rev_count = r_res.scalar() or 0

    analytics_data = analytics_service.calculate_library_analytics(
        papers=papers,
        notes_count=notes_count,
        collections_count=col_count,
        reviews_count=rev_count
    )

    return analytics_data
