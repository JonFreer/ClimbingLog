import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..db import get_db
from ..models import Projects
from ..users import User, current_active_user

router = APIRouter()


@router.get("/projects/me", response_model=List[uuid.UUID], tags=["projects"])
async def get_all_projects(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    result = await db.execute(
        select(Projects.route_id).where(Projects.user_id == user.id)
    )
    projects = result.scalars().all()
    return projects


@router.post("/projects/me/{route_id}", response_model=uuid.UUID, tags=["projects"])
async def create_projects(
    route_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    existing_project = await db.execute(
        select(Projects).where(
            Projects.route_id == route_id, Projects.user_id == user.id
        )
    )
    if existing_project.scalars().first():
        raise HTTPException(status_code=400, detail="Project already exists")

    new_project = Projects(route_id=route_id, user_id=user.id)
    db.add(new_project)
    await db.commit()
    await db.refresh(new_project)
    return new_project.route_id


@router.delete("/projects/me/{route_id}", response_model=uuid.UUID, tags=["projects"])
async def remove_projects(
    route_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    result = await db.execute(
        select(Projects).where(
            Projects.route_id == route_id, Projects.user_id == user.id
        )
    )
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.delete(project)
    await db.commit()
    return project.route_id
