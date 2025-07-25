import io
import uuid
from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, Response
from PIL import Image, ImageOps
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_
from sqlalchemy import case

from ..schemas.route import RouteWithClimbCount, Route
from ..schemas import schemas
from ..db import get_db
from ..models import Circuits, Climbs, Routes, Sets
from ..users import User, current_active_user, optional_user

router = APIRouter()


@router.get("/routes/get_all", response_model=List[RouteWithClimbCount], tags=["routes"])
async def get_all_routes(
    response: Response,
    user: Optional[User] = Depends(optional_user), #TODO: Update this so that is can be optionally used offline
    db: AsyncSession = Depends(get_db),
):

    result = await db.execute(
        select(
            Routes,
            func.sum(case((Climbs.sent == True, 1), else_=0)).label("climb_count"),
            func.sum(
                case(
                    (and_(Climbs.sent == True, Climbs.user == user.id) if user else False, 1),
                    else_=0,
                )
            ).label("user_sends"),
            func.sum(
                case(
                    (and_(Climbs.sent == False, Climbs.user == user.id) if user else False, 1),
                    else_=0,
                )
            ).label("user_attempts"),
            Circuits.color.label("circuit_color"),
            Circuits.gym_id.label("gym_id")
    
        )
           .outerjoin(Climbs, Climbs.route == Routes.id)
            .outerjoin(Sets, Sets.id == Routes.set_id)  # Join with Sets
            .outerjoin(Circuits, Circuits.id == Sets.circuit_id)  # Join with Circuits
            .group_by(Routes.id, Circuits.color, Circuits.gym_id)  # Group by Routes.id and Circuits.color #TODO: I think I can just group by route_id

    )   
    routes_with_counts = [
        {
            "id": route.id,
            "name": route.name,
            "grade": route.grade,
            "location": route.location,
            "style": route.style,
            "set_id": route.set_id,
            "x": route.x,
            "y": route.y,
            "climb_count": climb_count,
            "user_sends": user_sends,
            "user_attempts": user_attempts,
            "color": circuit_color if circuit_color is not None else "Unknown",
            "gym_id": gym_id
        }
        for route, climb_count, user_sends, user_attempts, circuit_color, gym_id in result.all()
    ]
    return routes_with_counts


@router.get(
    "/routes/sent_by/{route_id}", response_model=schemas.SentBy, tags=["routes"]
)
async def get_route(
    route_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    sent_by = []
    result = await db.execute(
        select(Climbs).where(Climbs.sent == True, Climbs.route == route_id)
    )
    climbs = result.scalars().all()

    user_ids = set()
    for climb in climbs:
        if climb.user not in user_ids:
            result = await db.execute(select(User).filter(User.id == climb.user))
            user = result.scalars().first()
            user_ids.add(climb.user)
            if user.send_visible:
                sent_by.append(
                    {
                        "id": user.id,
                        "username": user.username,
                        "has_profile_photo": user.has_profile_photo,
                    }
                )

    return {"users": sent_by, "num_users": len(user_ids)}


@router.post("/routes/create_with_image", response_model=Route, tags=["routes"])
async def create_route_with_image(
    name: Annotated[str, Form(...)],
    grade: Annotated[str, Form(...)],
    location: Annotated[str, Form(...)],
    style: Annotated[str, Form(...)],
    set_id: Annotated[uuid.UUID, Form(...)],
    x: Annotated[float, Form(...)],
    y: Annotated[float, Form(...)],
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    if not user.is_superuser and not user.route_setter:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    if "image" not in file.content_type:
        raise HTTPException(status_code=500, detail="File type must be an image")

    request_object_content = await file.read()
    im = Image.open(io.BytesIO(request_object_content))
    img_thumb = Image.open(io.BytesIO(request_object_content))
    MAX_SIZE_2 = (200, 250)
    img_thumb = ImageOps.fit(img_thumb, MAX_SIZE_2, Image.LANCZOS)

    new_route = Routes(
        grade=grade, location=location, style=style, set_id=set_id, name=name, x=x, y=y
    )
    db.add(new_route)
    await db.commit()
    await db.refresh(new_route)

    # Save the image
    im.save("./imgs/routes/full/" + str(new_route.id) + ".webp", "webp", quality=30)
    img_thumb.save(
        "./imgs/routes/thumb/" + str(new_route.id) + ".webp", "webp", quality=50
    )

    return new_route


@router.patch("/routes/update", response_model=Route, tags=["routes"])
async def update_route(
    route_id: Annotated[uuid.UUID, Form(...)],
    name: Annotated[str, Form(...)],
    grade: Annotated[str, Form(...)],
    location: Annotated[str, Form(...)],
    style: Annotated[str, Form(...)],
    set_id: Annotated[uuid.UUID, Form(...)],
    x: Annotated[float, Form(...)],
    y: Annotated[float, Form(...)],
    file: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    if not user.is_superuser and not user.route_setter:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    if file is not None:
        request_object_content = await file.read()
        im = Image.open(io.BytesIO(request_object_content))
        img_thumb = Image.open(io.BytesIO(request_object_content))
        MAX_SIZE_2 = (200, 250)
        img_thumb = ImageOps.fit(img_thumb, MAX_SIZE_2, Image.LANCZOS)
        im.save("./imgs/routes/full/" + str(route_id) + ".webp", "webp", quality=30)
        img_thumb.save(
            "./imgs/routes/thumb/" + str(route_id) + ".webp", "webp", quality=50
        )

    result = await db.execute(select(Routes).filter(Routes.id == route_id))
    route = result.scalars().first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    route.name = name
    route.grade = grade
    route.location = location
    route.style = style
    route.set_id = set_id
    route.x = x
    route.y = y

    db.add(route)
    await db.commit()
    await db.refresh(route)

    # Save the image

    return route


@router.delete("/routes/{route_id}", response_model=None, tags=["routes"])
async def remove_route(
    route_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    if not user.is_superuser and not user.route_setter:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    result = await db.execute(select(Routes).filter(Routes.id == route_id))
    route = result.scalars().first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    await db.delete(route)
    await db.commit()
    return None


@router.get(
    "/img/{img_id}", response_class=FileResponse, tags=["routes"]
)  # Add resposne model
def get_img(response: Response, img_id: str):
    return "./imgs/routes/full/" + img_id


@router.get(
    "/img_thumb/{img_id}", response_class=FileResponse, tags=["routes"]
)  # Add resposne model
def get_img(response: Response, img_id: str):
    return "./imgs/routes/thumb/" + img_id
