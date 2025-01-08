import uuid
from pydantic import BaseModel
from fastapi_users import schemas
import datetime
from typing import Optional

class UserRead(schemas.BaseUser[uuid.UUID]):
    username: str
    about:str
    profile_visible: bool
    send_visible: bool


class UserCreate(schemas.BaseUserCreate):
    username: str

class UserUpdate(schemas.BaseUserUpdate):
    username: Optional[str]
    profile_visible: Optional[bool]
    send_visible: Optional[bool]
    about: Optional[str]

class Route(BaseModel):
    name: str
    id: uuid.UUID
    grade: str
    location: str
    style: str
    circuit_id: uuid.UUID

class Circuit(BaseModel):
    id: uuid.UUID
    name: str
    color: str

class Climb(BaseModel):
    id: uuid.UUID
    sent: bool
    time: datetime.datetime
    route: uuid.UUID
    user: uuid.UUID