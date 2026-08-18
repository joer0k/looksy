from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.user import User


async def get_user_by_email(
        db: AsyncSession, email: str, ) -> User | None:
    return await db.scalar(select(User).where(User.email == email))


async def get_user_by_id(
        db: AsyncSession, user_id: int, ) -> User | None:
    return await db.get(User, user_id)



