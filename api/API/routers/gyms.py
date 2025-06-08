import uuid
from typing import Annotated, List
import io

from fastapi import APIRouter, Depends, Form, HTTPException, File, UploadFile
from fastapi.responses import Response, FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from PIL import Image, ImageOps

from .. import schemas
from ..schemas.gym import Gym as GymSchema
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
    name: Annotated[str, Form(...)],
    location: Annotated[str, Form(...)],
    about: Annotated[str, Form(...)],
    layout: Annotated[str, Form(...)],
    file: UploadFile = File(...), 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(current_active_superuser),
):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    


    new_gym = Gym(name=name,about=about,location=location,layout=layout)
    db.add(new_gym)
    await db.commit()
    await db.refresh(new_gym)

    request_object_content = await file.read()
    im = Image.open(io.BytesIO(request_object_content))
    MAX_SIZE_2 = (250, 250)
    im = ImageOps.fit(im, MAX_SIZE_2, Image.LANCZOS)
    # Save the image
    im.save("./imgs/gym/" + str(new_gym.id) + ".webp", "webp", quality=70)
    
    return new_gym

@router.patch("/gyms/{gym_id}", response_model=GymSchema, tags=["gyms"])
async def update_gym(
    gym_id: uuid.UUID,
    name: Annotated[str | None, Form()] = None,
    location: Annotated[str | None, Form()] = None,
    about: Annotated[str | None, Form()] = None,
    layout: Annotated[str | None, Form()] = None,
    file: UploadFile | None = File(None), 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(current_active_superuser),
):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    result = await db.execute(select(Gym).where(Gym.id == gym_id))
    existing_gym = result.scalars().first()
    
    if not existing_gym:
        raise HTTPException(status_code=404, detail="Gym not found")
    
    if name is not None:
        existing_gym.name = name
    if location is not None:
        existing_gym.location = location
    if about is not None:
        existing_gym.about = about
    if layout is not None:
        existing_gym.layout = layout
    
    if file is not None:
        request_object_content = await file.read()
        im = Image.open(io.BytesIO(request_object_content))
        MAX_SIZE_2 = (250, 250)
        im = ImageOps.fit(im, MAX_SIZE_2, Image.LANCZOS)
        # Save the image
        im.save("./imgs/gym/" + str(existing_gym.id) + ".webp", "webp", quality=70)
    
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

@router.get("/gyms/{gym_id}/image",response_class=FileResponse, tags=["gyms"])
async def get_gym_image(
    gym_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Gym).where(Gym.id == gym_id))
    existing_gym = result.scalars().first()
    
    if not existing_gym:
        raise HTTPException(status_code=404, detail="Gym not found")
    
    # layout_path = f"imgs/gym/{gym_id}.webp"
    # try:
    #     with open(layout_path, "r") as file:
    #         svg_content = file.read()
    # except FileNotFoundError:
    #     raise HTTPException(status_code=404, detail="Gym image not found")
    
    return f"imgs/gym/{gym_id}.webp"

