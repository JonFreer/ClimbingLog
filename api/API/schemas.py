import datetime
import uuid
from typing import Optional

from fastapi_users import schemas
from pydantic import BaseModel


class UserRead(schemas.BaseUser[uuid.UUID]):
    username: str
    about: str
    profile_visible: bool
    send_visible: bool
    route_setter: bool
    has_profile_photo: bool
    has_cover_photo: bool


class UserCreate(schemas.BaseUserCreate):
    username: str

class UserUpdate(schemas.BaseUserUpdate):
    username: Optional[str]
    profile_visible: Optional[bool]
    send_visible: Optional[bool]
    about: Optional[str]


class UserPublic(BaseModel):
    id: uuid.UUID
    username: str
    about: str
    profile_visible: bool
    send_visible: bool
    route_setter: bool
    has_profile_photo: bool
    has_cover_photo: bool


class Route(BaseModel):
    name: str
    id: uuid.UUID
    grade: str
    location: str
    style: str
    set_id: uuid.UUID
    x: float
    y: float


class Circuit(BaseModel):
    id: uuid.UUID
    name: str
    color: str


class Set(BaseModel):
    id: uuid.UUID
    circuit_id: uuid.UUID
    date: datetime.datetime
    name: Optional[str]


class Climb(BaseModel):
    id: uuid.UUID
    sent: bool
    time: datetime.datetime
    route: uuid.UUID
    user: uuid.UUID
    activity: Optional[uuid.UUID]


class UserNamePair(BaseModel):
    username: str
    has_profile_photo: bool
    id: uuid.UUID


class SentBy(BaseModel):
    users: list[UserNamePair]
    num_users: int


class ClimbFeed(BaseModel):
    id: uuid.UUID
    sent: bool
    time: datetime.datetime
    route: uuid.UUID
    user: uuid.UUID
    username: str
    has_profile_photo: bool


class Activity(BaseModel):
    id: uuid.UUID
    time: datetime.datetime
    user: uuid.UUID
    climb_ids: list[uuid.UUID]
    username: str
    has_profile_photo: bool
    reactions: list[UserNamePair]


class Reaction(BaseModel):
    id: uuid.UUID
    user: uuid.UUID
    activity: uuid.UUID


class RouteWithClimbCount(Route):
    climb_count: int

    class Config:
        from_attributes = True

class Video(BaseModel):
    id: uuid.UUID
    user: uuid.UUID
    route: uuid.UUID
    processed: bool
    time: datetime.datetime
    username: str
    has_profile_photo: bool
