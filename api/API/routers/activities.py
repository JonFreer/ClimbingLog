from typing import List

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from .. import schemas
from ..db import get_db
from ..models import Activities, Climbs, Reactions, User

router = APIRouter()


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
            select(Climbs).where(Climbs.activity == activity.id)
        )
        activity_dict = activity._asdict()  # Convert the Row object to a dictionary

        routes = {}
        for climb in climbs_result.scalars().all():
            routes[climb.route] = climb.id

        activity_dict["climb_ids"] = list(routes.values())  # Get the climb IDs

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
