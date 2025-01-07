import uuid
from pydantic import BaseModel
from fastapi_users import schemas
import datetime

class UserRead(schemas.BaseUser[uuid.UUID]):
    pass


class UserCreate(schemas.BaseUserCreate):
    pass


class UserUpdate(schemas.BaseUserUpdate):
    pass

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