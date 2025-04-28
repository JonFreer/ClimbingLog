import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..db import get_db
from ..models import Reactions
from ..users import User, current_active_user

router = APIRouter()


@router.post("/reactions/{activity_id}", response_model=uuid.UUID, tags=["reactions"])
async def create_reaction(
    activity_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    existing_reaction = await db.execute(
        select(Reactions).where(
            Reactions.activity == activity_id, Reactions.user == user.id
        )
    )
    if existing_reaction.scalars().first():
        raise HTTPException(status_code=400, detail="Reaction already exists")

    new_reaction = Reactions(activity=activity_id, user=user.id)
    db.add(new_reaction)
    await db.commit()
    await db.refresh(new_reaction)
    return new_reaction.id


@router.delete("/reactions/{activity_id}", response_model=uuid.UUID, tags=["reactions"])
async def delete_reaction(
    activity_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    result = await db.execute(
        select(Reactions).where(
            Reactions.activity == activity_id, Reactions.user == user.id
        )
    )
    reaction = result.scalars().first()
    if not reaction:
        raise HTTPException(status_code=404, detail="Reaction not found")

    await db.delete(reaction)
    await db.commit()
    return reaction.id
