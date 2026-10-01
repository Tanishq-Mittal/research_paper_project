import uuid
import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.database.models import User, Collection, CollectionPaper, Paper
from app.schemas.schemas import CollectionCreate, CollectionUpdate, CollectionResponse, PaperResponse
from app.api.papers import format_paper_response
from app.security.auth import get_current_user

router = APIRouter(prefix="/collections", tags=["Collections"])

@router.get("", response_model=List[CollectionResponse])
async def list_collections(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Collection)
        .where(Collection.user_id == current_user.id)
        .options(selectinload(Collection.paper_links).selectinload(CollectionPaper.paper).selectinload(Paper.authors))
        .order_by(Collection.created_at.asc())
    )
    res = await db.execute(stmt)
    collections = res.scalars().all()

    result = []
    for c in collections:
        papers = []
        for link in c.paper_links:
            if link.paper:
                papers.append(format_paper_response(link.paper))
        result.append(CollectionResponse(
            id=c.id,
            name=c.name,
            description=c.description,
            color=c.color,
            icon=c.icon,
            paper_count=len(papers),
            papers=papers,
            created_at=c.created_at,
            updated_at=c.updated_at
        ))
    return result


@router.post("", response_model=CollectionResponse)
async def create_collection(
    req: CollectionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    col = Collection(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=req.name,
        description=req.description,
        color=req.color or "#6366f1",
        icon=req.icon or "folder"
    )
    db.add(col)
    await db.flush()

    if req.paper_ids:
        for pid in req.paper_ids:
            db.add(CollectionPaper(collection_id=col.id, paper_id=pid))

    await db.commit()
    await db.refresh(col)

    return CollectionResponse(
        id=col.id,
        name=col.name,
        description=col.description,
        color=col.color,
        icon=col.icon,
        paper_count=len(req.paper_ids or []),
        papers=[],
        created_at=col.created_at,
        updated_at=col.updated_at
    )


@router.patch("/{collection_id}", response_model=CollectionResponse)
async def update_collection(
    collection_id: str,
    req: CollectionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Collection).where(Collection.id == collection_id, Collection.user_id == current_user.id)
    res = await db.execute(stmt)
    col = res.scalar_one_or_none()
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found.")

    if req.name is not None:
        col.name = req.name
    if req.description is not None:
        col.description = req.description
    if req.color is not None:
        col.color = req.color
    if req.icon is not None:
        col.icon = req.icon

    col.updated_at = datetime.datetime.utcnow()
    await db.commit()
    await db.refresh(col)

    return CollectionResponse(
        id=col.id,
        name=col.name,
        description=col.description,
        color=col.color,
        icon=col.icon,
        paper_count=0,
        papers=[],
        created_at=col.created_at,
        updated_at=col.updated_at
    )


@router.delete("/{collection_id}")
async def delete_collection(
    collection_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Collection).where(Collection.id == collection_id, Collection.user_id == current_user.id)
    res = await db.execute(stmt)
    col = res.scalar_one_or_none()
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found.")

    await db.delete(col)
    await db.commit()
    return {"message": "Collection deleted successfully."}


@router.post("/{collection_id}/papers")
async def add_papers_to_collection(
    collection_id: str,
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    paper_ids = payload.get("paper_ids", [])
    stmt = select(Collection).where(Collection.id == collection_id, Collection.user_id == current_user.id)
    res = await db.execute(stmt)
    col = res.scalar_one_or_none()
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found.")

    for pid in paper_ids:
        # Check if already in collection
        link_stmt = select(CollectionPaper).where(CollectionPaper.collection_id == collection_id, CollectionPaper.paper_id == pid)
        l_res = await db.execute(link_stmt)
        if not l_res.scalar_one_or_none():
            db.add(CollectionPaper(collection_id=collection_id, paper_id=pid))

    await db.commit()
    return {"message": f"Added {len(paper_ids)} paper(s) to collection."}
