import datetime
import uuid
from typing import Optional

from pydantic import BaseModel

class Gym(BaseModel):
    id: uuid.UUID
    name: str
    location: str
    about: str
    layout: str

class GymCreate(BaseModel):
    name: str
    location: str
    about: str
    layout: str

class GymUpdate(BaseModel): 
    name: Optional[str] = None
    location: Optional[str] = None
    about: Optional[str] = None
    layout: Optional[str] = None

