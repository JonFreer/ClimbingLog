import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.sql import func

from .. import schemas
from ..db import get_db
from ..models import Activities, Climbs, User
from ..users import current_active_superuser

router = APIRouter()


@router.get(
    "/admin/users/get_all", response_model=List[schemas.UserRead], tags=["admin"]
)
async def list_users(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_superuser),
):
    if not user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    result = await db.execute(select(User))
    users = result.scalars().all()
    return users


@router.post(
    "/admin/users/promote/{user_id}", response_model=schemas.UserRead, tags=["admin"]
)
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


@router.post(
    "/admin/users/demote/{user_id}", response_model=schemas.UserRead, tags=["admin"]
)
async def demote_user(
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
    user_to_promote.is_superuser = False
    db.add(user_to_promote)
    await db.commit()
    await db.refresh(user_to_promote)
    return user_to_promote


@router.post(
    "/admin/users/promote/route_setter/{user_id}",
    response_model=schemas.UserRead,
    tags=["admin"],
)
async def promote_route_setter(
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
    user_to_promote.route_setter = True
    db.add(user_to_promote)
    await db.commit()
    await db.refresh(user_to_promote)
    return user_to_promote


@router.post(
    "/admin/users/demote/route_setter/{user_id}",
    response_model=schemas.UserRead,
    tags=["admin"],
)
async def demote_route_setter(
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
    user_to_promote.route_setter = False
    db.add(user_to_promote)
    await db.commit()
    await db.refresh(user_to_promote)
    return user_to_promote


@router.post(
    "/admin/activites/generate_activies/",
    response_model=None,
    tags=["admin"],
)
async def generate_activities(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_superuser),
):
    if not user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    climbs = await db.execute(select(Climbs))
    for climb in climbs.scalars().all():
        activity = await db.execute(
            select(Activities).where(
                Activities.user == climb.user,
                func.date(Activities.time) == climb.time.date(),
            )
        )

        existing_activity = activity.scalars().first()

        if existing_activity is None:
            existing_activity = Activities(time=climb.time, user=climb.user)
            db.add(existing_activity)
            await db.commit()
            await db.refresh(existing_activity)

        climb.activity = existing_activity.id

        db.add(climb)
        await db.commit()
        await db.refresh(climb)


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
