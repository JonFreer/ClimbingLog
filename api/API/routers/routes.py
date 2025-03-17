from .. import schemas
from fastapi import APIRouter, Depends, UploadFile, File,Form,HTTPException 
from fastapi.responses import Response, FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_db
from ..models import Circuits, Climbs, Routes
from ..users import current_active_user, User
from sqlalchemy.future import select
from typing import Annotated, List, Optional
from PIL import Image,ImageOps
import uuid
import io
router = APIRouter()

@router.get("/routes/get_all", response_model=List[schemas.Route], tags=["routes"])
async def get_all_routes(
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Routes))
    routes = result.scalars().all()
    return routes

@router.get("/routes/sent_by/{route_id}", response_model=schemas.SentBy, tags=["routes"])
async def get_route(
    route_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):


    sent_by = []
    result = await db.execute(select(Climbs).where(Climbs.sent == True, Climbs.route == route_id))
    climbs = result.scalars().all()

    user_ids = set()
    for climb in climbs:
        if climb.user not in user_ids:
            result = await db.execute(select(User).filter(User.id == climb.user))
            user = result.scalars().first()
            user_ids.add(climb.user)
            if user.send_visible:
                sent_by.append({"id": user.id, "username": user.username})

    return {"users": sent_by, "num_users": len(user_ids)}

@router.post("/routes/create_with_image", response_model=schemas.Route, tags=["routes"])
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

        new_route = Routes(grade=grade, location=location, style=style, set_id=set_id,name=name,x=x,y=y)
        db.add(new_route)
        await db.commit()
        await db.refresh(new_route)

        # Save the image
        im.save("./imgs/routes/full/" + str(new_route.id) + ".webp", "webp",quality=30)
        img_thumb.save("./imgs/routes/thumb/" + str(new_route.id) + ".webp", "webp",quality=50)
        
        return new_route

@router.patch("/routes/update", response_model=schemas.Route, tags=["routes"])
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
        img_thumb.save("./imgs/routes/thumb/" + str(route_id) + ".webp", "webp", quality=50)
    

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

@router.delete("/routes/remove_route/{route_id}", response_model=None, tags=["routes"])
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



@router.get("/img/{img_id}",response_class=FileResponse, tags=["routes"]) #Add resposne model
def get_img(response: Response,
            img_id:str):
    return "./imgs/routes/full/"+img_id

@router.get("/img_thumb/{img_id}",response_class=FileResponse, tags=["routes"]) #Add resposne model
def get_img(response: Response,
            img_id:str):
    return "./imgs/routes/thumb/"+img_id