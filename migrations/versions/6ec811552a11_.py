"""empty message

Revision ID: 6ec811552a11
Revises: 2dd14e0d6315
Create Date: 2018-02-10 19:30:26.946873

"""

# revision identifiers, used by Alembic.
revision = '6ec811552a11'
down_revision = '2dd14e0d6315'

from alembic import op
import sqlalchemy as sa


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('module', sa.Column('semester', sa.String(length=100), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('module', 'semester')
    # ### end Alembic commands ###
