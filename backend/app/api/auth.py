import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.session import get_db
from app.database.models import User
from app.schemas.schemas import UserCreate, UserLogin, UserResponse, UserUpdate, TokenResponse
from app.security.tokens import get_password_hash, verify_password, create_access_token
from app.security.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
async def register(
    user_in: UserCreate, 
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.email == user_in.email)
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    user = User(
        id=str(uuid.uuid4()),
        email=user_in.email.strip() if user_in.email else "",
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role or "Student Researcher",
        research_interests=user_in.research_interests or "Machine Learning, NLP",
        preferred_citation_style=user_in.preferred_citation_style or "APA"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, token_type="bearer", user=user)


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == credentials.email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, token_type="bearer", user=user)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/profile", response_model=UserResponse)
async def update_profile(
    updates: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if updates.full_name is not None:
        current_user.full_name = updates.full_name
    if updates.role is not None:
        current_user.role = updates.role
    if updates.research_interests is not None:
        current_user.research_interests = updates.research_interests
    if updates.preferred_citation_style is not None:
        current_user.preferred_citation_style = updates.preferred_citation_style
    if updates.theme is not None:
        current_user.theme = updates.theme
    if updates.ai_model_pref is not None:
        current_user.ai_model_pref = updates.ai_model_pref
    if updates.default_language is not None:
        current_user.default_language = updates.default_language

    current_user.updated_at = datetime.datetime.utcnow()
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.post("/forgot-password")
async def forgot_password(payload: dict):
    # Safe mock recovery response
    return {"message": "If an account exists with this email, password reset instructions have been generated."}
