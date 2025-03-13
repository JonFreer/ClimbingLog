import uuid
from .. import schemas
from fastapi import APIRouter, Depends, UploadFile, File,Form,HTTPException 
from typing import Annotated, List
from fastapi.responses import Response, FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_db
from ..models import Climbs, Projects, Routes
from ..users import current_active_user, User
from sqlalchemy.future import select
import datetime

router = APIRouter()

@router.get("/projects/me/get_all", response_model=List[uuid.UUID], tags=["projects"])
async def get_all_projects(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    result = await db.execute(select(Projects.route_id).where(Projects.user_id == user.id))
    projects = result.scalars().all()
    print(projects)
    return projects

@router.post("/projects/me/add", response_model=uuid.UUID, tags=["projects"])
async def create_projects(
    route_id: Annotated[uuid.UUID, Form(...)],
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    existing_project = await db.execute(select(Projects).where(Projects.route_id == route_id, Projects.user_id == user.id))
    if existing_project.scalars().first():
        raise HTTPException(status_code=400, detail="Project already exists")
    
    new_project = Projects(route_id=route_id, user_id=user.id)
    db.add(new_project)
    await db.commit()
    await db.refresh(new_project)
    return new_project.route_id
  
@router.delete("/projects/me/remove", response_model=uuid.UUID, tags=["projects"])
async def remove_projects(
    route_id: Annotated[uuid.UUID, Form(...)],
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    result = await db.execute(select(Projects).where(Projects.route_id == route_id, Projects.user_id == user.id))
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.delete(project)
    await db.commit()
    return project.route_id
  