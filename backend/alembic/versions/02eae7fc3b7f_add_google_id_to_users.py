"""add_google_id_to_users

Revision ID: 02eae7fc3b7f
Revises: 0001_initial_schema
Create Date: 2026-02-28 03:15:35.288811

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '02eae7fc3b7f'
down_revision = '0001_initial_schema'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add google_id column to users table
    op.add_column('users', sa.Column('google_id', sa.String(), nullable=True))
    op.create_unique_constraint('uq_users_google_id', 'users', ['google_id'])


def downgrade() -> None:
    # Remove google_id column from users table
    op.drop_constraint('uq_users_google_id', 'users', type_='unique')
    op.drop_column('users', 'google_id')
