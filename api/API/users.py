import uuid
from typing import Optional

from .email import send_verify_email, send_forgot_password_email
from fastapi import Depends, HTTPException, Request, status
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin, models
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy.future import select

from .db import get_user_db
from .models import User
from .schemas.schemas import UserCreate, UserUpdate

SECRET = "SECRET"


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        print(f"User {user.id} has registered.")

    async def on_after_forgot_password(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        send_forgot_password_email(
            email=user.email,
            token=token,
            user=user,
        )
        print(f"User {user.id} has forgot their password. Reset token: {token}")

    async def on_after_request_verify(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        send_verify_email(
            email=user.email,
            token=token,
            user=user,
        )
        print(f"Verification requested for user {user.id}. Verification token: {token}")

    # Override create, injecting some check logic and then call Parent function via super()
    async def create(
        self,
        user_create: UserCreate,  # ancestor of the Base schema so it's ok
        safe: bool = False,
        request: Optional[Request] = None,
    ) -> models.UP:
        existing_user = await self.user_db._get_user(
            select(User).filter(User.username == user_create.username)
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="REGISTER_USERNAME_ALREADY_EXISTS",
            )
        return await super().create(user_create, safe, request)

    async def update(
        self,
        user_update: UserUpdate,
        user: models.UP,
        safe: bool = False,
        request: Optional[Request] = None,
    ) -> models.UP:
        # Check if the username is already taken
        existing_user = await self.user_db._get_user(
            select(User)
            .filter((User.username == user_update.username))
            .filter(User.id != user.id)
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="UPDATE_USERNAME_ALREADY_EXISTS",
            )
        return await super().update(user_update, user, safe, request)


async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)


bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")


def get_jwt_strategy() -> JWTStrategy[models.UP, models.ID]:
    return JWTStrategy(secret=SECRET, lifetime_seconds=2592000)


auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, uuid.UUID](get_user_manager, [auth_backend])


current_active_user = fastapi_users.current_user(active=True)
current_active_superuser = fastapi_users.current_user(active=True, superuser=True)

async def optional_user(
    user: User = Depends(fastapi_users.current_user(optional=True))
) -> Optional[User]:
    return user 
