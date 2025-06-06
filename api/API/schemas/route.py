import uuid
from pydantic import BaseModel

class Route(BaseModel):
    name: str
    id: uuid.UUID
    grade: str
    location: str
    style: str
    set_id: uuid.UUID
    x: float
    y: float

class RouteWithClimbCount(Route):
    climb_count: int
    user_sends: int
    user_attempts: int
    color: str
    gym_id: uuid.UUID

    class Config:
        from_attributes = True