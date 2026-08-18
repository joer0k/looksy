
from fastapi import APIRouter, status, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User
from app.schemas.auth import UserResponse, UserRegister, TokenResponse, UserLogin
from app.core.security import hash_password, verify_password, create_access_token
from app.core.database import get_db
from app.core.dependencies import get_current_active_user
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

@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def login_user(data: UserLogin, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    user = await db.scalar(
        select(User).where(User.email == data.email)
    )
    if user is None or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Incorrect email or password'
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='User account is inactive'
        )
    access_token = create_access_token(str(user.id))

    return TokenResponse(access_token=access_token, token_type='bearer')

@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def get_me(current_user: User = Depends(get_current_active_user),
                 ) -> User:
    return current_user