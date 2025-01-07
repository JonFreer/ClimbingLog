# from sqlalchemy import create_engine
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker
from . import models
from .config import DatabaseURL
# from . import models
# print("db.py init")
# engine = create_engine(DatabaseURL)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base = declarative_base()

from collections.abc import AsyncGenerator

from fastapi import Depends
from fastapi_users.db import SQLAlchemyBaseUserTableUUID, SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

# DATABASE_URL = "sqlite+aiosqlite:///./test.db"


engine = create_async_engine(DatabaseURL,
    pool_size=10,  # Increase the pool size
    max_overflow=20,  # Increase the overflow limit
    pool_timeout=30)  # Increase the timeout)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, models.User)

async def get_db(session: AsyncSession = Depends(get_async_session)):
    yield session