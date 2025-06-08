import datetime
from typing import Optional
import uuid
from .route import Route, RouteWithClimbCount
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
    home_gym: Optional[uuid.UUID]

class UserCreate(schemas.BaseUserCreate):
    username: str

class UserUpdate(schemas.BaseUserUpdate):
    username: Optional[str]
    profile_visible: Optional[bool]
    send_visible: Optional[bool]
    about: Optional[str]
    home_gym: Optional[uuid.UUID] 

class UserPublic(BaseModel):
    id: uuid.UUID
    username: str
    about: str
    profile_visible: bool
    send_visible: bool
    route_setter: bool
    has_profile_photo: bool
    has_cover_photo: bool
    home_gym: Optional[uuid.UUID]

class Circuit(BaseModel):
    id: uuid.UUID
    name: str
    color: str
    gym_id: uuid.UUID

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

class ClimbShort(BaseModel):
    route: RouteWithClimbCount
    time: datetime.datetime

class Activity(BaseModel):
    id: uuid.UUID
    time: datetime.datetime
    user: uuid.UUID
    climbs: list[ClimbShort]
    username: str
    has_profile_photo: bool
    reactions: list[UserNamePair]
    gym_id: uuid.UUID


class Reaction(BaseModel):
    id: uuid.UUID
    user: uuid.UUID
    activity: uuid.UUID

class Video(BaseModel):
    id: uuid.UUID
    user: uuid.UUID
    route: uuid.UUID
    processed: bool
    time: datetime.datetime
    username: str
    has_profile_photo: bool

