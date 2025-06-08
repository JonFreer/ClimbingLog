import datetime
import uuid
from typing import Annotated, List

from fastapi import APIRouter, Depends, Form, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..schemas import schemas
from ..db import get_db
from ..models import Circuits, Routes, Sets
from ..users import User, current_active_user

router = APIRouter()

# update circuit_id to set_id


@router.get("/sets/{gym_id}", response_model=List[schemas.Set], tags=["sets"])
async def get_all_sets(
    gym_id: uuid.UUID,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Sets)
        .join(Circuits, Sets.circuit_id == Circuits.id)
        .filter(Circuits.gym_id == gym_id)
    )
    sets = result.scalars().all()
    return sets


@router.post("/sets/create", response_model=schemas.Set, tags=["sets"])
async def create_set(
    name: Annotated[str, Form(...)],
    date: Annotated[datetime.datetime, Form(...)],
    circuit_id: Annotated[uuid.UUID, Form(...)],
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    if not user.is_superuser and not user.route_setter:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    date_obj = date.date()  # Convert timestamp to date object
    new_set = Sets(circuit_id=circuit_id, name=name, date=date_obj)
    db.add(new_set)
    await db.commit()
    await db.refresh(new_set)
    return new_set


@router.delete("/sets/remove/{set_id}", response_model=None, tags=["sets"])
async def remove_set(
    set_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    if not user.is_superuser and user.route_setter:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    result = await db.execute(select(Sets).filter(Sets.id == set_id))
    circuit = result.scalars().first()
    if not circuit:
        raise HTTPException(status_code=404, detail="Set not found")

    # Find and delete all routes associated with the circuit
    routes_result = await db.execute(select(Routes).filter(Routes.set_id == set_id))
    routes = routes_result.scalars().all()
    for route in routes:
        await db.delete(route)

    await db.delete(circuit)
    await db.commit()
    return None
