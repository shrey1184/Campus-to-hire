"""add_target_role_and_focus_area

Revision ID: 8b9c0d1e2f3a
Revises: 6f2b9c3d4e5f
Create Date: 2026-03-07 15:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision: str = "8b9c0d1e2f3a"
down_revision: Union[str, Sequence[str], None] = "6f2b9c3d4e5f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_exists(table_name: str, column_name: str) -> bool:
    inspector = inspect(op.get_bind())
    columns = [col["name"] for col in inspector.get_columns(table_name)]
    return column_name in columns


def upgrade() -> None:
    if not _column_exists("roadmaps", "target_role"):
        op.add_column("roadmaps", sa.Column("target_role", sa.String(), nullable=True))

    if not _column_exists("daily_plans", "focus_area"):
        op.add_column("daily_plans", sa.Column("focus_area", sa.String(), nullable=True))


def downgrade() -> None:
    if _column_exists("daily_plans", "focus_area"):
        op.drop_column("daily_plans", "focus_area")

    if _column_exists("roadmaps", "target_role"):
        op.drop_column("roadmaps", "target_role")
