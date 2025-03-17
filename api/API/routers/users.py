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

@router.get("/users/get_public/{username}", response_model=schemas.UserPublic, tags=["users"])
async def get_user_info(
    username: str,
    db: AsyncSession = Depends(get_db),
):
   
    user = await db.execute(select(User).filter(User.username == username))
    user = user.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.profile_visible:
        return user
    
    raise HTTPException(status_code=403, detail="Profile is not visible")

@router.get("/users/get_climbs/{username}", response_model=List[schemas.Climb], tags=["users"])
async def get_user_climbs(
    username: str,
    db: AsyncSession = Depends(get_db),
):
   
    climbs = await db.execute(select(Climbs).join(User).filter(User.username == username))
    climbs = climbs.scalars().all()
    if not climbs:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = await db.execute(select(User).filter(User.username == username))
    user = user.scalars().first()
    
    if user.profile_visible and user.send_visible:
        return climbs
    
    raise HTTPException(status_code=403, detail="Climbs is not visible")
