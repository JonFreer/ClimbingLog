import io
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, Response
from PIL import Image, ImageOps
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from .. import schemas
from ..db import get_db
from ..models import Climbs
from ..users import User, current_active_user

router = APIRouter()


@router.get(
    "/users/get_public/{username}", response_model=schemas.UserPublic, tags=["users"]
)
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


@router.get(
    "/users/get_climbs/{username}", response_model=List[schemas.Climb], tags=["users"]
)
async def get_user_climbs(
    username: str,
    db: AsyncSession = Depends(get_db),
):
    climbs = await db.execute(
        select(Climbs).join(User).filter(User.username == username)
    )
    climbs = climbs.scalars().all()
    if not climbs:
        raise HTTPException(status_code=404, detail="User not found")

    user = await db.execute(select(User).filter(User.username == username))
    user = user.scalars().first()

    if user.profile_visible and user.send_visible:
        return climbs

    raise HTTPException(status_code=403, detail="Climbs is not visible")


@router.post("/users/me/update_cover_photo", response_model=None, tags=["users"])
async def update_cover_photo(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    if "image" not in file.content_type:
        raise HTTPException(status_code=500, detail="File type must be an image")
    print("saving photo")

    user.has_cover_photo = True
    db.add(user)
    await db.commit()
    await db.refresh(user)

    request_object_content = await file.read()
    im = Image.open(io.BytesIO(request_object_content))
    # Save the image
    im.save("./imgs/cover_photos/" + str(user.id) + ".webp", "webp", quality=70)

    return None


@router.get(
    "/cover_photo/{user_id}", response_class=FileResponse, tags=["users"]
)  # Add resposne model
def get_img(response: Response, user_id: str):
    return "./imgs/cover_photos/" + str(user_id) + ".webp"


@router.post("/users/me/update_profile_photo", response_model=None, tags=["users"])
async def update_profile_photo(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    if "image" not in file.content_type:
        raise HTTPException(status_code=500, detail="File type must be an image")
    print("saving photo")

    user.has_profile_photo = True
    db.add(user)
    await db.commit()
    await db.refresh(user)

    request_object_content = await file.read()
    im = Image.open(io.BytesIO(request_object_content))
    MAX_SIZE_2 = (250, 250)
    im = ImageOps.fit(im, MAX_SIZE_2, Image.LANCZOS)
    # Save the image
    im.save("./imgs/profile_photos/" + str(user.id) + ".webp", "webp", quality=70)

    return None


@router.get(
    "/profile_photo/{user_id}", response_class=FileResponse, tags=["users"]
)  # Add resposne model
def get_img(response: Response, user_id: str):
    return "./imgs/profile_photos/" + str(user_id) + ".webp"


@router.get("/users/valid_user_name/{username}", response_model=bool, tags=["users"])
async def valid_user_name(
    username: str,
    db: AsyncSession = Depends(get_db),
):
    user = await db.execute(select(User).filter(User.username == username))
    user = user.scalars().first()

    return user is None
