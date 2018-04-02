"""empty message

Revision ID: b65d23fb2477
Revises: 4d5e818c4b6e
Create Date: 2018-02-22 23:11:24.509850

"""

# revision identifiers, used by Alembic.
revision = 'b65d23fb2477'
down_revision = '4d5e818c4b6e'

from alembic import op
import sqlalchemy as sa


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('staff', sa.Column('school', sa.Integer(), nullable=True))
    op.add_column('staff', sa.Column('school_2', sa.Integer(), nullable=True))
    op.add_column('staff', sa.Column('school_3', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'staff', 'school', ['school_2'], ['id'])
    op.create_foreign_key(None, 'staff', 'school', ['school_3'], ['id'])
    op.create_foreign_key(None, 'staff', 'school', ['school'], ['id'])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'staff', type_='foreignkey')
    op.drop_constraint(None, 'staff', type_='foreignkey')
    op.drop_constraint(None, 'staff', type_='foreignkey')
    op.drop_column('staff', 'school_3')
    op.drop_column('staff', 'school_2')
    op.drop_column('staff', 'school')
    # ### end Alembic commands ###
