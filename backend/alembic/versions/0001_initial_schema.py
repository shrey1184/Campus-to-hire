"""Initial schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-02-27 20:15:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = "0001_initial_schema"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _table_exists(table_name: str) -> bool:
    inspector = inspect(op.get_bind())
    return table_name in inspector.get_table_names()


def _column_exists(table_name: str, column_name: str) -> bool:
    inspector = inspect(op.get_bind())
    if table_name not in inspector.get_table_names():
        return False
    return any(col.get("name") == column_name for col in inspector.get_columns(table_name))


def _index_exists(table_name: str, index_name: str) -> bool:
    inspector = inspect(op.get_bind())
    if table_name not in inspector.get_table_names():
        return False
    return any(idx.get("name") == index_name for idx in inspector.get_indexes(table_name))


def upgrade() -> None:
    if not _table_exists("users"):
        op.create_table(
            "users",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("email", sa.String(), nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("password_hash", sa.String(), nullable=True),
            sa.Column("avatar_url", sa.String(), nullable=True),
            sa.Column("auth_provider", sa.String(), nullable=True),
            sa.Column("college", sa.String(), nullable=True),
            sa.Column("college_tier", sa.String(), nullable=True),
            sa.Column("degree", sa.String(), nullable=True),
            sa.Column("major", sa.String(), nullable=True),
            sa.Column("current_year", sa.Integer(), nullable=True),
            sa.Column("is_cs_background", sa.Boolean(), nullable=True, server_default=sa.text("false")),
            sa.Column("target_role", sa.String(), nullable=True),
            sa.Column("target_companies", sa.JSON(), nullable=True),
            sa.Column("hours_per_day", sa.Integer(), nullable=True, server_default=sa.text("2")),
            sa.Column("days_per_week", sa.Integer(), nullable=True, server_default=sa.text("5")),
            sa.Column("preferred_language", sa.String(), nullable=True, server_default=sa.text("'en'")),
            sa.Column("skills", sa.JSON(), nullable=True),
            sa.Column("onboarding_completed", sa.Boolean(), nullable=True, server_default=sa.text("false")),
            sa.Column("created_at", sa.DateTime(), nullable=True, server_default=sa.text("now()")),
            sa.Column("updated_at", sa.DateTime(), nullable=True, server_default=sa.text("now()")),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("email"),
        )
    elif not _column_exists("users", "password_hash"):
        # Existing DBs created pre-Alembic need this column for local auth.
        op.add_column("users", sa.Column("password_hash", sa.String(), nullable=True))

    if not _table_exists("roadmaps"):
        op.create_table(
            "roadmaps",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("user_id", sa.String(), nullable=True),
            sa.Column("content", sa.JSON(), nullable=True),
            sa.Column("pace", sa.String(), nullable=True, server_default=sa.text("'standard'")),
            sa.Column("total_weeks", sa.Integer(), nullable=True),
            sa.Column("current_week", sa.Integer(), nullable=True, server_default=sa.text("1")),
            sa.Column("current_day", sa.Integer(), nullable=True, server_default=sa.text("1")),
            sa.Column("is_active", sa.Boolean(), nullable=True, server_default=sa.text("true")),
            sa.Column("created_at", sa.DateTime(), nullable=True, server_default=sa.text("now()")),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )

    if not _table_exists("daily_plans"):
        op.create_table(
            "daily_plans",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("roadmap_id", sa.String(), nullable=True),
            sa.Column("user_id", sa.String(), nullable=True),
            sa.Column("week", sa.Integer(), nullable=True),
            sa.Column("day", sa.Integer(), nullable=True),
            sa.Column("tasks", sa.JSON(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=True, server_default=sa.text("now()")),
            sa.ForeignKeyConstraint(["roadmap_id"], ["roadmaps.id"]),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )

    if not _table_exists("interviews"):
        op.create_table(
            "interviews",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("user_id", sa.String(), nullable=True),
            sa.Column("role", sa.String(), nullable=True),
            sa.Column("company", sa.String(), nullable=True),
            sa.Column("messages", sa.JSON(), nullable=True),
            sa.Column("score", sa.Integer(), nullable=True),
            sa.Column("feedback", sa.String(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=True, server_default=sa.text("now()")),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )

    # Create performance indexes only if missing.
    if not _index_exists("roadmaps", "ix_roadmaps_user_id"):
        op.create_index("ix_roadmaps_user_id", "roadmaps", ["user_id"], unique=False)
    if not _index_exists("daily_plans", "ix_daily_plans_user_id"):
        op.create_index("ix_daily_plans_user_id", "daily_plans", ["user_id"], unique=False)
    if not _index_exists("daily_plans", "ix_daily_plans_roadmap_id"):
        op.create_index("ix_daily_plans_roadmap_id", "daily_plans", ["roadmap_id"], unique=False)
    if not _index_exists("interviews", "ix_interviews_user_id"):
        op.create_index("ix_interviews_user_id", "interviews", ["user_id"], unique=False)


def downgrade() -> None:
    if _index_exists("interviews", "ix_interviews_user_id"):
        op.drop_index("ix_interviews_user_id", table_name="interviews")
    if _table_exists("interviews"):
        op.drop_table("interviews")

    if _index_exists("daily_plans", "ix_daily_plans_roadmap_id"):
        op.drop_index("ix_daily_plans_roadmap_id", table_name="daily_plans")
    if _index_exists("daily_plans", "ix_daily_plans_user_id"):
        op.drop_index("ix_daily_plans_user_id", table_name="daily_plans")
    if _table_exists("daily_plans"):
        op.drop_table("daily_plans")

    if _index_exists("roadmaps", "ix_roadmaps_user_id"):
        op.drop_index("ix_roadmaps_user_id", table_name="roadmaps")
    if _table_exists("roadmaps"):
        op.drop_table("roadmaps")

    if _table_exists("users"):
        op.drop_table("users")
