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