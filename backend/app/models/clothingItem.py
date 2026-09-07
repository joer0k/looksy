from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from ..core.database import Base


class ClothingItem(Base):
    name: Mapped[str]
    category: Mapped[str]
    color: Mapped[str]
    season: Mapped[str]
    image_key: Mapped[str | None] = mapped_column(nullable=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey('users.id', ondelete='CASCADE'),
        index=True,
    )