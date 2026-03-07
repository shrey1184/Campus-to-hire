"""add_resources_table

Revision ID: 6f2b9c3d4e5f
Revises: 02eae7fc3b7f
Create Date: 2026-03-07 14:10:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision: str = "6f2b9c3d4e5f"
down_revision: Union[str, Sequence[str], None] = "02eae7fc3b7f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _table_exists(table_name: str) -> bool:
    inspector = inspect(op.get_bind())
    return table_name in inspector.get_table_names()


def _index_exists(table_name: str, index_name: str) -> bool:
    inspector = inspect(op.get_bind())
    if table_name not in inspector.get_table_names():
        return False
    return any(idx.get("name") == index_name for idx in inspector.get_indexes(table_name))


def upgrade() -> None:
    if not _table_exists("resources"):
        op.create_table(
            "resources",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("title", sa.String(), nullable=False),
            sa.Column("topic", sa.String(), nullable=False),
            sa.Column("sub_topic", sa.String(), nullable=True),
            sa.Column("difficulty", sa.String(), nullable=False),
            sa.Column("resource_type", sa.String(), nullable=False),
            sa.Column("url", sa.String(), nullable=False),
            sa.Column("youtube_url", sa.String(), nullable=True),
            sa.Column("platform", sa.String(), nullable=False),
            sa.Column("estimated_minutes", sa.Integer(), nullable=True),
            sa.Column("tags", sa.JSON(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=True, server_default=sa.text("now()")),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("url"),
        )

    if not _index_exists("resources", "ix_resources_topic"):
        op.create_index("ix_resources_topic", "resources", ["topic"], unique=False)
    if not _index_exists("resources", "ix_resources_difficulty"):
        op.create_index("ix_resources_difficulty", "resources", ["difficulty"], unique=False)
    if not _index_exists("resources", "ix_resources_resource_type"):
        op.create_index("ix_resources_resource_type", "resources", ["resource_type"], unique=False)


def downgrade() -> None:
    if _index_exists("resources", "ix_resources_resource_type"):
        op.drop_index("ix_resources_resource_type", table_name="resources")
    if _index_exists("resources", "ix_resources_difficulty"):
        op.drop_index("ix_resources_difficulty", table_name="resources")
    if _index_exists("resources", "ix_resources_topic"):
        op.drop_index("ix_resources_topic", table_name="resources")
    if _table_exists("resources"):
        op.drop_table("resources")
