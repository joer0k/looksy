from http.client import HTTPException

from fastapi import APIRouter, status, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User
from app.schemas.auth import UserResponse, UserRegister
from app.core.security import hash_password
from app.core.database import get_db
router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse,status_code=status.HTTP_201_CREATED)
async def register_user(data: UserRegister, db: AsyncSession = Depends(get_db)) -> User:
    user = await db.scalar(
        select(User).where(User.email == data.email)
    )

    if user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists"
        )

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        birth_date=data.birth_date,
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user