from .. import schemas
from fastapi import APIRouter, Depends, UploadFile, File,Form,HTTPException 
from fastapi.responses import Response, FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_db
from ..models import Circuits, Routes
from sqlalchemy.future import select
from typing import Annotated, List
from PIL import Image
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

# @router.post("/routes/create", response_model=schemas.Route, tags=["routes"])
# async def create_route(
#     name: str,
#     grade: str,
#     location: str,
#     style:str,
#     x: float,
#     y:float, 
#     circuit_id: uuid.UUID,
#     response: Response,
#     db: AsyncSession = Depends(get_db),
# ):
#     new_route = Routes(grade=grade,location=location,style=style,circuit_id=circuit_id,name=name)
#     db.add(new_route)
#     await db.commit()
#     await db.refresh(new_route)
#     return new_route


# @router.post("/routes/create", response_model=schemas.Route, tags=["routes"])
# async def create_route(
#     name: str,
#     grade: str,
#     location: str,
#     style:str,
#     circuit_id: uuid.UUID,
#     response: Response,
#     db: AsyncSession = Depends(get_db),
# ):
#     new_route = Routes(grade=grade,location=location,style=style,circuit_id=circuit_id,name=name)
#     db.add(new_route)
#     await db.commit()
#     await db.refresh(new_route)
#     return new_route

@router.post("/routes/create_with_image", response_model=schemas.Route, tags=["routes"])
async def create_route_with_image(
        name: Annotated[str, Form(...)],
        grade: Annotated[str, Form(...)],
        location: Annotated[str, Form(...)],
        style: Annotated[str, Form(...)],
        circuit_id: Annotated[uuid.UUID, Form(...)],
        x: Annotated[float, Form(...)],
        y: Annotated[float, Form(...)],
        file: UploadFile = File(...),
        db: AsyncSession = Depends(get_db),
    ):
        if "image" not in file.content_type:
            raise HTTPException(status_code=500, detail="File type must be an image")
        
        request_object_content = await file.read()
        im = Image.open(io.BytesIO(request_object_content))

        new_route = Routes(grade=grade, location=location, style=style, circuit_id=circuit_id,name=name,x=x,y=y)
        db.add(new_route)
        await db.commit()
        await db.refresh(new_route)

        # Save the image
        im.save("./imgs/" + str(new_route.id) + ".webp", "webp")
        
        return new_route


@router.get("/circuits/get_all", response_model=List[schemas.Circuit], tags=["circuits"])
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
):
    new_circuit = Circuits(name=name, color=color)
    db.add(new_circuit)
    await db.commit()
    await db.refresh(new_circuit)
    return new_circuit


@router.get("/img/{img_id}",response_class=FileResponse, tags=["routes"]) #Add resposne model
def get_img(response: Response,
            img_id:str):
    return "./imgs/"+img_id