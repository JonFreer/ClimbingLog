import uuid
from typing import Annotated, List

from fastapi import APIRouter, Depends, Form, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from .. import schemas
from ..db import get_db
from ..models import Circuits
from ..users import User, current_active_user

router = APIRouter()


@router.get(
    "/circuits/get_all", response_model=List[schemas.Circuit], tags=["circuits"]
)
async def get_all_circuits(
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Circuits))
    circuits = result.scalars().all()
    return circuits


@router.post("/circuits/create", response_model=schemas.Circuit, tags=["circuits"])
async def create_circuit(
    name: Annotated[str, Form(...)],
    color: Annotated[str, Form(...)],
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    if not user.is_superuser and not user.route_setter:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    new_circuit = Circuits(name=name, color=color)
    db.add(new_circuit)
    await db.commit()
    await db.refresh(new_circuit)
    return new_circuit


@router.delete("/circuits/{circuit_id}", response_model=None, tags=["circuits"])
async def remove_circuit(
    circuit_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    if not user.is_superuser and user.route_setter:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    result = await db.execute(select(Circuits).filter(Circuits.id == circuit_id))
    circuit = result.scalars().first()
    if not circuit:
        raise HTTPException(status_code=404, detail="Circuit not found")

    await db.delete(circuit)
    await db.commit()
    return None
