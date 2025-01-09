from .. import schemas
from fastapi import APIRouter, Depends, UploadFile, File,Form,HTTPException 
from fastapi.responses import Response, FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_db, get_user_db
from ..models import Circuits, Routes, User
from sqlalchemy.future import select
from typing import Annotated, Any, Dict, List
import uuid
from ..users import current_active_user, current_active_superuser

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

@router.get("/admin/users/get_all", response_model=List[schemas.UserRead], tags=["admin"])
async def list_users(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_superuser),
):
    if not user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    result = await db.execute(select(User))
    users = result.scalars().all()
    return users

@router.post("/admin/users/promote/{user_id}", response_model=schemas.UserRead, tags=["admin"])
async def promote_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_superuser),
):
    if not user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    result = await db.execute(select(User).filter(User.id == user_id))
    user_to_promote = result.scalars().first()
    if not user_to_promote:
        raise HTTPException(status_code=404, detail="User not found")
    user_to_promote.is_superuser = True
    db.add(user_to_promote)
    await db.commit()
    await db.refresh(user_to_promote)
    return user_to_promote

# @router.get("/admin/users/get_all", response_model=List[schemas.UserRead], tags=["admin"])
# async def list_users(
#    db: AsyncSession = Depends(get_user_db),
# ):
  
#   users_collection = db["users"]  # `db` is an instance of `AsyncIOMotorDatabase` (just like in the FastAPI Users exampleà
#   query: Dict[str, Any] = {}  # Start to build a query (empty query means everything in MongoDB)

#   # Perform the query
#   cursor = users_collection.find(query)  # This an async iterator
#   results = [User(**obj) async for obj in cursor]  # For each result, MongoDB gives us a raw dictionary that we hydrate back in our Pydantic model

#   return results