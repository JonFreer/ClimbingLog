from operator import and_
from typing import Any, Dict, List

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, case
from sqlalchemy import and_

from ..schemas import schemas
from ..schemas.route import RouteWithClimbCount
from ..db import get_db
from ..models import Activities, Circuits, Climbs, Reactions, Routes, Sets
from ..users import User, current_active_user

router = APIRouter()


@router.get(
    "/activities/get_paginated",
    response_model=Dict[str, Any],  # Updated response model to include metadata
    tags=["activities"],
)
async def get_paginated_activities(
    response: Response,
    page: int = 1,
    page_size: int = 10,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user)
):
    offset = (page - 1) * page_size

    result = await db.execute(
        select(
            Activities.id,
            Activities.user,
            Activities.time,
            Activities.gym_id,
            User.username,
            User.has_profile_photo,
        )
        .join(User, Activities.user == User.id)
        .order_by(Activities.time.desc())
        .offset(offset)
        .limit(page_size)
    )

    activities = result.all()

    for activity in activities:
        climbs_result = await db.execute(
            select(
                Routes,
                Climbs.time,
                func.sum(case((Climbs.sent == True, 1), else_=0)).label("climb_count"),
                func.sum(case((and_(Climbs.sent == True, Climbs.user == user.id), 1), else_=0)).label("user_sends"),
                func.sum(case((and_(Climbs.sent == False, Climbs.user == user.id), 1), else_=0)).label("user_attempts"),
                Circuits.color.label("circuit_color"),
                Circuits.gym_id.label("gym_id")
            )
            .outerjoin(Climbs, Climbs.route == Routes.id)
            .outerjoin(Sets, Sets.id == Routes.set_id)  # Join with Sets
            .outerjoin(Circuits, Circuits.id == Sets.circuit_id)  # Join with Circuits
            .where(Climbs.activity == activity.id)
            .group_by(Routes.id, Climbs.time, Circuits.color, Circuits.gym_id)  # Group by Routes.id, Climbs.time, and Circuits.color
        )
        activity_dict = activity._asdict()  # Convert the Row object to a dictionary

        routes = {}
        for route,time, climb_count, user_sends, user_attempts, circuit_color, gym_id in climbs_result.all():
                routes[route.id] = {
                    "route": {
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
                    },
                    "time": time,
                }
        
        
        activity_dict["climbs"] = list(routes.values()) 

        activities[
            activities.index(activity)
        ] = activity_dict  # Replace the Row object with the updated dictionary

        reactions_result = await db.execute(
            select(
                Reactions.id.label("reaction_id"),
                User.id.label("user_id"),
                User.username.label("user_username"),
                User.has_profile_photo.label("user_has_profile_photo"),
            )
            .join(User, Reactions.user == User.id)
            .where(Reactions.activity == activity.id)
        )
        reactions = reactions_result.all()
        activity_dict["reactions"] = [
            {
                "id": reaction.user_id,
                "username": reaction.user_username,
                "has_profile_photo": reaction.user_has_profile_photo,
            }
            for reaction in reactions
        ]

    total_activities = await db.execute(select(Activities.id))
    total = len(total_activities.scalars().all())
    total_pages = (total + page_size - 1) // page_size

    meta = {
        "page": page,
        "total": total,
        "totalPages": total_pages,
    }

    return {"data": activities, "meta": meta}


@router.get(
    "/activities/get_all", response_model=List[schemas.Activity], tags=["activities"]
)
async def get_all_activities(
    response: Response,
    db: AsyncSession = Depends(get_db),
     user: User = Depends(current_active_user),
):
    result = await db.execute(
        select(
            Activities.id,
            Activities.user,
            Activities.time,
            Activities.gym_id,
            User.username,
            User.has_profile_photo,
        )
        .join(User, Activities.user == User.id)
        .order_by(Activities.time.desc())
    )

    activities = result.all()

    for activity in activities:
        climbs_result = await db.execute(
            select(
                Routes,
                Climbs.time,
                func.sum(case((Climbs.sent == True, 1), else_=0)).label("climb_count"),
                func.sum(case((and_(Climbs.sent == True, Climbs.user == user.id), 1), else_=0)).label("user_sends"),
                func.sum(case((and_(Climbs.sent == False, Climbs.user == user.id), 1), else_=0)).label("user_attempts"),
                Circuits.color.label("circuit_color"),
                Circuits.gym_id.label("gym_id")
            )
            .outerjoin(Climbs, Climbs.route == Routes.id)
            .outerjoin(Sets, Sets.id == Routes.set_id)  # Join with Sets
            .outerjoin(Circuits, Circuits.id == Sets.circuit_id)  # Join with Circuits
            .where(Climbs.activity == activity.id)
            .group_by(Routes.id, Climbs.time, Circuits.color, Circuits.gym_id)  # Updated to group by gym_id
        )
      
        activity_dict = activity._asdict()  # Convert the Row object to a dictionary
        routes = {}
        for route,time, climb_count, user_sends, user_attempts, circuit_color, gym_id in climbs_result.all():
            routes[route.id] = {
                "route": {
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
                },
                "time": time,
            }
        
        activity_dict["climbs"] = list(routes.values()) 

        activities[
            activities.index(activity)
        ] = activity_dict  # Replace the Row object with the updated dictionary

        reactions_result = await db.execute(
            select(
                Reactions.id.label("reaction_id"),
                User.id.label("user_id"),
                User.username.label("user_username"),
                User.has_profile_photo.label("user_has_profile_photo"),
            )
            .join(User, Reactions.user == User.id)
            .where(Reactions.activity == activity.id)
        )
        reactions = reactions_result.all()
        activity_dict["reactions"] = [
            {
                "id": reaction.user_id,
                "username": reaction.user_username,
                "has_profile_photo": reaction.user_has_profile_photo,
            }
            for reaction in reactions
        ]

    return activities
