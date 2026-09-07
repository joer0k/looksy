"""rename image_url to image_key

Revision ID: 81a71126f18b
Revises: 7d4338f3df48
Create Date: 2026-09-07 16:49:28.995137

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '81a71126f18b'
down_revision: Union[str, Sequence[str], None] = '7d4338f3df48'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "clothingitems",
        "image_url",
        new_column_name="image_key",
    )


def downgrade() -> None:
    op.alter_column(
        "clothingitems",
        "image_key",
        new_column_name="image_url",
    )