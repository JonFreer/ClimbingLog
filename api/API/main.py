from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from starlette.middleware.sessions import SessionMiddleware

from . import config
from .db import create_db_and_tables
from .models import User
from .routers import (
    activities,
    admin,
    circuits,
    climbs,
    projects,
    reactions,
    routes,
    sets,
    users,
)
from .schemas import UserCreate, UserRead, UserUpdate
from .users import auth_backend, current_active_user, fastapi_users


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Not needed if you setup a migration system like Alembic
    await create_db_and_tables()
    yield


# models.Base.metadata.create_all(bind=engine)

app = FastAPI(root_path="/api", title="Climbing Trackers", lifespan=lifespan)
app.add_middleware(SessionMiddleware, secret_key=config.SessionSecret)

app.include_router(
    fastapi_users.get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth"]
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)


@app.get("/authenticated-route")
async def authenticated_route(user: User = Depends(current_active_user)):
    return {"message": f"Hello {user.email}!"}


app.include_router(routes.router)
app.include_router(climbs.router)
app.include_router(admin.router)
app.include_router(projects.router)
app.include_router(circuits.router)
app.include_router(sets.router)
app.include_router(users.router)
app.include_router(activities.router)
app.include_router(reactions.router)
