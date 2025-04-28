import datetime
import uuid

from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class User(SQLAlchemyBaseUserTableUUID, Base):
    username = Column(String, index=True, nullable=False, unique=True)
    profile_visible = Column(Boolean, index=True, nullable=False, default=True)
    route_setter = Column(Boolean, index=True, nullable=False, default=False)
    send_visible = Column(Boolean, index=True, nullable=False, default=True)
    about = Column(String, index=False, nullable=False, default="")
    has_profile_photo = Column(Boolean, index=False, nullable=False, default=False)
    has_cover_photo = Column(Boolean, index=False, nullable=False, default=False)


class Routes(Base):
    __tablename__ = "routes"
    id: uuid.UUID = Column(
        UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4
    )
    grade: str = Column(String, index=True, nullable=False)
    location: str = Column(String, index=True, nullable=False)
    style: str = Column(String, index=True, nullable=False)
    set_id: uuid.UUID = Column(UUID(as_uuid=True), index=True, nullable=False)
    name: str = Column(String, index=True, nullable=True)
    x: float = Column(Float, index=False, nullable=False)
    y: float = Column(Float, index=False, nullable=False)


class Circuits(Base):
    __tablename__ = "circuits"
    id: uuid.UUID = Column(
        UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4
    )
    name: str = Column(String, index=True, nullable=False)
    color: str = Column(String, index=False, nullable=False)


class Sets(Base):
    __tablename__ = "sets"
    id: uuid.UUID = Column(
        UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4
    )
    circuit_id: uuid.UUID = Column(
        UUID(as_uuid=True), ForeignKey("circuits.id"), index=True, nullable=False
    )
    date: datetime.datetime = Column(DateTime, index=True, nullable=False)
    name: str = Column(String, index=True, nullable=True)


class Climbs(Base):
    __tablename__ = "climbs"
    id: uuid.UUID = Column(
        UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4
    )
    sent: bool = Column(Boolean, index=True, nullable=False)
    time: datetime.datetime = Column(DateTime, index=True, nullable=False)
    route: uuid.UUID = Column(
        UUID(as_uuid=True), ForeignKey("routes.id"), index=True, nullable=False
    )
    user: uuid.UUID = Column(
        UUID(as_uuid=True), ForeignKey("user.id"), index=True, nullable=False
    )
    activity: uuid.UUID = Column(
        UUID(as_uuid=True), ForeignKey("activities.id"), index=True, nullable=False
    )


class Projects(Base):
    __tablename__ = "projects"
    route_id = Column(
        UUID(as_uuid=True),
        ForeignKey("routes.id"),
        primary_key=True,
        index=True,
        nullable=False,
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("user.id"),
        primary_key=True,
        index=True,
        nullable=False,
    )


class Activities(Base):
    __tablename__ = "activities"
    id: uuid.UUID = Column(
        UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4
    )
    time: datetime.datetime = Column(DateTime, index=True, nullable=False)
    user: uuid.UUID = Column(
        UUID(as_uuid=True), ForeignKey("user.id"), index=True, nullable=False
    )


class Reactions(Base):
    __tablename__ = "reactions"
    id: uuid.UUID = Column(
        UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4
    )
    user: uuid.UUID = Column(
        UUID(as_uuid=True), ForeignKey("user.id"), index=True, nullable=False
    )
    activity: uuid.UUID = Column(
        UUID(as_uuid=True), ForeignKey("activities.id"), index=True, nullable=False
    )
