from datetime import date

from sqlalchemy.orm import Mapped, mapped_column
from ..core.database import Base


class User(Base):
    email: Mapped[str] = mapped_column(unique=True, index=True)
    password_hash: Mapped[str]
    is_active: Mapped[bool] = mapped_column(default=True)
    birth_date: Mapped[date]