import uuid
from typing import Annotated, List

from fastapi import APIRouter, Depends, Form, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from .. import schemas
from ..schemas.gym import Gym as GymSchema, GymCreate
from ..db import get_db
from ..models import Circuits, Gym
from ..users import User, current_active_user, current_active_superuser

router = APIRouter()

@router.get("/gyms", response_model=List[GymSchema], tags=["gyms"])
async def get_gyms(
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Gym))
    gyms = result.scalars().all()
    return gyms

@router.post("/gyms", response_model=GymSchema, tags=["gyms"])
async def create_gym(
    gym: GymCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(current_active_superuser),
):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    new_gym = Gym(**gym.dict())
    db.add(new_gym)
    await db.commit()
    await db.refresh(new_gym)
    
    return new_gym

@router.patch("/gyms/{gym_id}", response_model=GymSchema, tags=["gyms"])
async def update_gym(
    gym_id: uuid.UUID,
    gym: GymCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(current_active_superuser),
):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    result = await db.execute(select(Gym).where(Gym.id == gym_id))
    existing_gym = result.scalars().first()
    
    if not existing_gym:
        raise HTTPException(status_code=404, detail="Gym not found")
    
    for key, value in gym.dict(exclude_unset=True).items():
        setattr(existing_gym, key, value)
    
    db.add(existing_gym)
    await db.commit()
    await db.refresh(existing_gym)
    
    return existing_gym

@router.delete("/gyms/{gym_id}", status_code=204, tags=["gyms"])
async def delete_gym(
    gym_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(current_active_superuser),
):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    result = await db.execute(select(Gym).where(Gym.id == gym_id))
    existing_gym = result.scalars().first()
    
    if not existing_gym:
        raise HTTPException(status_code=404, detail="Gym not found")
    
    await db.delete(existing_gym)
    await db.commit()
    
    return Response(status_code=204)

@router.get("/gyms/{gym_id}/layout", tags=["gyms"])
async def get_gym_layout(
    gym_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Gym).where(Gym.id == gym_id))
    existing_gym = result.scalars().first()
    
    if not existing_gym:
        raise HTTPException(status_code=404, detail="Gym not found")
    
    layout_path = f"imgs/gym_layout/{gym_id}.svg"
    try:
        with open(layout_path, "r") as file:
            svg_content = file.read()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Gym layout not found")
    
    return Response(content=svg_content, media_type="image/svg+xml")