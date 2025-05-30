from operator import and_
from typing import Any, Dict, List

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from .. import schemas
from ..db import get_db
from ..models import Activities, Climbs, Reactions, User

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
):
    offset = (page - 1) * page_size

    result = await db.execute(
        select(
            Activities.id,
            Activities.user,
            Activities.time,
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
            select(Climbs).where(Climbs.activity == activity.id)
        )
        activity_dict = activity._asdict()  # Convert the Row object to a dictionary

        routes = {}
        for climb in climbs_result.scalars().all():
            routes[climb.route] = {"route_id":climb.route, "time": climb.time}
        
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
):
    result = await db.execute(
        select(
            Activities.id,
            Activities.user,
            Activities.time,
            User.username,
            User.has_profile_photo,
        )
        .join(User, Activities.user == User.id)
        .order_by(Activities.time.desc())
    )

    activities = result.all()

    for activity in activities:
        climbs_result = await db.execute(
            select(Climbs).where(and_(Climbs.activity == activity.id, Climbs.sent == True))
        )
        activity_dict = activity._asdict()  # Convert the Row object to a dictionary

        routes = {}
        for climb in climbs_result.scalars().all():
            routes[climb.route] = {"route_id":climb.route, "time": climb.time}
        
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
