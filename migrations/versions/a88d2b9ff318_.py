"""empty message

Revision ID: a88d2b9ff318
Revises: 6a1d5b118d31
Create Date: 2018-03-07 15:29:58.333774

"""

# revision identifiers, used by Alembic.
revision = 'a88d2b9ff318'
down_revision = '6a1d5b118d31'

from alembic import op
import sqlalchemy as sa


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('o_auth2_token',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.String(length=255), nullable=False),
    sa.Column('token_type', sa.String(length=100), nullable=True),
    sa.Column('access_token', sa.String(length=500), nullable=False),
    sa.Column('refresh_token', sa.String(length=48), nullable=True),
    sa.Column('expires_at', sa.Integer(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('o_auth2_token')
    # ### end Alembic commands ###
