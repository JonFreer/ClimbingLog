from .. import schemas
from fastapi import APIRouter, Depends, UploadFile, File,Form,HTTPException 
from fastapi.responses import Response, FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_db
from ..models import Circuits, Routes
from sqlalchemy.future import select
from typing import Annotated, List
import uuid

router = APIRouter()

# @router.pacth("/routes/create", response_model=schemas.Route, tags=["users"])
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