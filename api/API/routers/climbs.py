import datetime
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.sql import func

from ..schemas import schemas
from ..db import get_db
from ..models import Activities, Climbs, Reactions, Routes, Sets, Circuits
from ..users import User, current_active_user

router = APIRouter()


@router.get("/climbs/get_all", response_model=List[schemas.ClimbFeed], tags=["climbs"])
async def get_all_climbs(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(
            Climbs.user,
            Climbs.id,
            Climbs.route,
            Climbs.sent,
            Climbs.time,
            User.username,
            User.has_profile_photo,
        )
        .join(User, Climbs.user == User.id)
        .where(Climbs.sent == True)
    )
    routes = result.all()  # Changed from scalars().all() to all()

    return routes


@router.get("/climbs/me", response_model=List[schemas.Climb], tags=["climbs"])
async def get_all_climbs(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    result = await db.execute(select(Climbs).where(Climbs.user == user.id))
    routes = result.scalars().all()
    return routes


@router.post(
    "/climbs/me/add_attempt/{route_id}", response_model=schemas.Climb, tags=["climbs"]
)
async def create_attempt(
    route_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    new_climb = Climbs(
        time=datetime.datetime.now(), sent=False, route=route_id, user=user.id
    )
    db.add(new_climb)
    await db.commit()
    await db.refresh(new_climb)
    return new_climb


@router.post(
    "/climbs/me/add_send/{route_id}", response_model=schemas.Climb, tags=["climbs"]
)
async def create_send(
    route_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    
    # Get gym_id from the route 

    gym_id = await db.execute(
        select(Circuits.gym_id)
        .select_from(Routes) 
        .where(Routes.id == route_id)
        .outerjoin(Sets, Sets.id == Routes.set_id)  # Join with Sets
        .outerjoin(Circuits, Circuits.id == Sets.circuit_id)  
        )
    
    gym_id = gym_id.scalars().first()
    # Check if an activity already exists for this user today
    if not gym_id:
        raise HTTPException(status_code=404, detail="Route not found")
    
    activity = await db.execute(
        select(Activities).where(
            Activities.user == user.id,
            func.date(Activities.time) == datetime.datetime.today().date(),
            Activities.gym_id == gym_id
        )
    )

    existing_activity = activity.scalars().first()
    if existing_activity:
        current_activity = existing_activity
    else:
        current_activity = Activities(time=datetime.datetime.now(), user=user.id, gym_id=gym_id)
        db.add(current_activity)
        await db.commit()
        await db.refresh(current_activity)

    new_climb = Climbs(
        time=datetime.datetime.now(),
        sent=True,
        route=route_id,
        user=user.id,
        activity=current_activity.id,
    )
    db.add(new_climb)
    await db.commit()
    await db.refresh(new_climb)

    return new_climb


@router.delete("/climbs/me/{climb_id}", response_model=schemas.Climb, tags=["climbs"])
async def remove_climb(
    climb_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    result = await db.execute(
        select(Climbs).where(Climbs.id == climb_id, Climbs.user == user.id)
    )
    climb = result.scalars().first()
    if not climb:
        raise HTTPException(status_code=404, detail="Climb not found")

    # Count the number of activities associated with the climb
    activity_count = await db.execute(
        select(func.count()).where(Climbs.activity == climb.activity)
    )
    count = activity_count.scalar()

    if count == 1:
        # If this is the only activity associated with the climb, delete the activity


        activity = await db.execute(
            select(Activities).where(Activities.id == climb.activity)
        )
        activity_instance = activity.scalars().first()

        #delete all reactions associated with the activity
        reactions = await db.execute(
            select(Reactions).where(Reactions.activity == activity_instance.id)
        )
        for reaction in reactions.scalars().all():
            await db.delete(reaction)
            await db.commit()

        await db.delete(activity_instance)
        await db.commit()



    await db.delete(climb)
    await db.commit()
    return climb
