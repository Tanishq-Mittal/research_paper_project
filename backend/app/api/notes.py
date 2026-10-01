import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.database.models import User, Note, Highlight, Paper
from app.schemas.schemas import NoteCreate, NoteUpdate, NoteResponse, HighlightCreate, HighlightResponse
from app.security.auth import get_current_user

router = APIRouter(tags=["Notes & Highlights"])

@router.get("/notes", response_model=List[NoteResponse])
async def list_notes(
    paper_id: Optional[str] = None,
    tag: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Note)
        .where(Note.user_id == current_user.id)
        .options(selectinload(Note.paper))
        .order_by(Note.created_at.desc())
    )
    if paper_id:
        stmt = stmt.where(Note.paper_id == paper_id)
    if tag:
        stmt = stmt.where(Note.tag == tag)

    res = await db.execute(stmt)
    notes = res.scalars().all()

    return [
        NoteResponse(
            id=n.id,
            paper_id=n.paper_id,
            paper_title=n.paper.title if n.paper else None,
            title=n.title,
            content=n.content,
            tag=n.tag,
            page_number=n.page_number,
            selected_text=n.selected_text,
            created_at=n.created_at,
            updated_at=n.updated_at
        )
        for n in notes
    ]


@router.post("/notes", response_model=NoteResponse)
async def create_note(
    req: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    p_title = None
    if req.paper_id:
        p_stmt = select(Paper).where(Paper.id == req.paper_id)
        p_res = await db.execute(p_stmt)
        p_obj = p_res.scalar_one_or_none()
        if p_obj:
            p_title = p_obj.title

    note = Note(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        paper_id=req.paper_id,
        title=req.title,
        content=req.content,
        tag=req.tag or "General",
        page_number=req.page_number,
        selected_text=req.selected_text
    )
    db.add(note)
    await db.commit()
    await db.refresh(note)

    return NoteResponse(
        id=note.id,
        paper_id=note.paper_id,
        paper_title=p_title,
        title=note.title,
        content=note.content,
        tag=note.tag,
        page_number=note.page_number,
        selected_text=note.selected_text,
        created_at=note.created_at,
        updated_at=note.updated_at
    )


@router.patch("/notes/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: str,
    req: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Note).where(Note.id == note_id, Note.user_id == current_user.id).options(selectinload(Note.paper))
    res = await db.execute(stmt)
    note = res.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found.")

    if req.title is not None:
        note.title = req.title
    if req.content is not None:
        note.content = req.content
    if req.tag is not None:
        note.tag = req.tag

    note.updated_at = datetime.datetime.utcnow()
    await db.commit()
    await db.refresh(note)

    return NoteResponse(
        id=note.id,
        paper_id=note.paper_id,
        paper_title=note.paper.title if note.paper else None,
        title=note.title,
        content=note.content,
        tag=note.tag,
        page_number=note.page_number,
        selected_text=note.selected_text,
        created_at=note.created_at,
        updated_at=note.updated_at
    )


@router.delete("/notes/{note_id}")
async def delete_note(
    note_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    res = await db.execute(stmt)
    note = res.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found.")

    await db.delete(note)
    await db.commit()
    return {"message": "Note deleted successfully."}


@router.post("/highlights", response_model=HighlightResponse)
async def create_highlight(
    req: HighlightCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    hl = Highlight(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        paper_id=req.paper_id,
        page_number=req.page_number,
        text=req.text,
        color=req.color or "#fef08a",
        note_text=req.note_text
    )
    db.add(hl)
    await db.commit()
    await db.refresh(hl)
    return hl


@router.get("/papers/{paper_id}/highlights", response_model=List[HighlightResponse])
async def list_paper_highlights(
    paper_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Highlight)
        .where(Highlight.paper_id == paper_id, Highlight.user_id == current_user.id)
        .order_by(Highlight.page_number.asc())
    )
    res = await db.execute(stmt)
    return res.scalars().all()
