import uuid
from .. import schemas
from fastapi import APIRouter, Depends, UploadFile, File,Form,HTTPException 
from typing import Annotated, List
from fastapi.responses import Response, FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_db
from ..models import Climbs, Routes
from ..users import current_active_user, User
from sqlalchemy.future import select
import datetime

router = APIRouter()


@router.get("/climbs/get_all", response_model=List[schemas.ClimbFeed], tags=["climbs"])
async def get_all_climbs(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Climbs.user,Climbs.id,Climbs.route,Climbs.sent,Climbs.time, User.username, User.has_profile_photo)
        .join(User, Climbs.user == User.id)
        .where(Climbs.sent == True)
    )
    routes = result.all()  # Changed from scalars().all() to all()

    
    print(routes)
    return routes

@router.get("/climbs/me/get_all", response_model=List[schemas.Climb], tags=["climbs"])
async def get_all_climbs(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    result = await db.execute(select(Climbs).where(Climbs.user == user.id))
    routes = result.scalars().all()
    print(routes)
    return routes

@router.post("/climbs/me/add_attempt", response_model=schemas.Climb, tags=["climbs"])
async def create_attempt(
    route: Annotated[uuid.UUID, Form(...)],
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    new_climb = Climbs(time=datetime.datetime.now(),
                       sent=False,
                       route=route,
                       user=user.id)
    db.add(new_climb)
    await db.commit()
    await db.refresh(new_climb)
    return new_climb

@router.post("/climbs/me/add_send", response_model=schemas.Climb, tags=["climbs"])
async def create_send(
    route: Annotated[uuid.UUID, Form(...)],
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    new_climb = Climbs(time=datetime.datetime.now(),
                       sent=True,
                       route=route,
                       user=user.id)
    db.add(new_climb)
    await db.commit()
    await db.refresh(new_climb)
    return new_climb

@router.delete("/climbs/me/remove_climb", response_model=schemas.Climb, tags=["climbs"])
async def remove_climb(
    climb_id: Annotated[uuid.UUID, Form(...)],
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    result = await db.execute(select(Climbs).where(Climbs.id == climb_id, Climbs.user == user.id))
    climb = result.scalars().first()
    if not climb:
        raise HTTPException(status_code=404, detail="Climb not found")
    await db.delete(climb)
    await db.commit()
    return climb
