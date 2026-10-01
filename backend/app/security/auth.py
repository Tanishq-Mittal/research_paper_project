from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.session import get_db
from app.database.models import User
from app.security.tokens import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # If no token provided, check if a demo user exists to make testing smooth
    if not token:
        # Fallback to default demo researcher user
        stmt = select(User).where(User.email == "demo@scholarpulse.edu")
        result = await db.execute(stmt)
        demo_user = result.scalar_one_or_none()
        if demo_user:
            return demo_user
        raise credentials_exception

    user_id = decode_access_token(token)
    if user_id is None:
        raise credentials_exception
        
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
    return user

async def get_optional_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    if not token:
        stmt = select(User).where(User.email == "demo@scholarpulse.edu")
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        return user
    try:
        return await get_current_user(token=token, db=db)
    except HTTPException:
        stmt = select(User).where(User.email == "demo@scholarpulse.edu")
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
