from datetime import date, datetime, timezone
from unittest.mock import AsyncMock

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio.session import AsyncSession

from app.models import User
from app.core.dependencies import get_current_user
from app.main import app
from app.core.database import get_db
from app.v1 import auth as auth_module


def override_database(db: AsyncSession) -> None:
    async def override_get_db() -> AsyncSession:
        return db

    app.dependency_overrides[get_db] = override_get_db


@pytest.mark.asyncio
async def test_active_user(client: AsyncClient):
    user = User(
        email="user@example.com",
        password_hash="not_a_real_hash",
        is_active=True,
        birth_date=date(2000, 1, 1),
    )
    user.id = 1
    user.created_at = datetime.now(timezone.utc)

    async def override_get_current_user() -> User:
        return user

    app.dependency_overrides[get_current_user] = override_get_current_user

    response = await client.get("/auth/me")

    assert response.status_code == 200
    response_data = response.json()

    assert response_data["id"] == 1
    assert response_data["email"] == "user@example.com"
    assert response_data["is_active"] is True
    assert response_data["birth_date"] == "2000-01-01"
    assert "created_at" in response_data
    assert "password_hash" not in response_data

@pytest.mark.asyncio
async def test_inactive_user(client: AsyncClient):
    user = User(
        email="user@example.com",
        password_hash="not_a_real_hash",
        is_active=False,
        birth_date=date(2000, 1, 1),
    )
    user.id = 1
    user.created_at = datetime.now(timezone.utc)

    async def override_current_user() -> User:
        return user

    app.dependency_overrides[get_current_user] = override_current_user
    
    response = await client.get("/auth/me")

    assert response.status_code == 403
    assert response.json() == {"detail": "Inactive user"}

@pytest.mark.asyncio
async def test_register_success(client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch):
    db = AsyncMock(spec=AsyncSession)
    db.scalar.return_value = None

    async def refresh_user(user: User):
        user.id = 1
        user.is_active = True
        user.created_at = datetime.now(timezone.utc)

    db.refresh.side_effect = refresh_user

    override_database(db)

    monkeypatch.setattr(
        auth_module,
        "hash_password",
        lambda password: "hashed-password",
    )
    
    response = await client.post("/auth/register",
        json={
            "email": "user@example.com",
            "password": "Strongpassword1",
            "confirm_password": "Strongpassword1",
            "birth_date": "2000-01-01",
            "terms_accepted": True,
        })

    assert response.status_code == 201

    response_data = response.json()

    assert response_data["id"] == 1
    assert response_data["email"] == "user@example.com"
    assert response_data["birth_date"] == "2000-01-01"
    assert response_data["is_active"] is True
    assert "password" not in response_data
    assert "password_hash" not in response_data

    created_user = db.add.call_args.args[0]

    assert created_user.email == "user@example.com"
    assert created_user.password_hash == "hashed-password"
    assert created_user.birth_date == date(2000, 1, 1)

    db.add.assert_called_once()
    db.commit.assert_awaited_once()
    db.refresh.assert_awaited_once()


@pytest.mark.asyncio
async def test_register_repeated(client: AsyncClient):
    existing_user = User(
        email="user@example.com",
        password_hash="hashed-password",
        is_active=True,
        birth_date=date(2000, 1, 1),
    )

    db = AsyncMock(spec=AsyncSession)
    db.scalar.return_value = existing_user
    override_database(db)

    response = await client.post("/auth/register", json={
        "email": "user@example.com",
        "password": "Strongpassword1",
        "confirm_password": "Strongpassword1",
        "birth_date": "2000-01-01",
        "terms_accepted": True,
    })

    assert response.status_code == 409
    assert response.json() == {"detail": "User with this email already exists"}

    db.add.assert_not_called()
    db.commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch):
    user = User(
        email="user@example.com",
        password_hash="saved_hash",
        birth_date=date(2000, 1, 1),
        is_active=True,
    )

    user.id = 1

    db = AsyncMock(spec=AsyncSession)
    db.scalar.return_value = user
    override_database(db)

    monkeypatch.setattr(
        auth_module,
        "verify_password",
        lambda plain_password, hashes_password: True,
    )

    monkeypatch.setattr(
        auth_module,
        "create_access_token",
        lambda subject: "test-access-token",
    )

    response = await client.post(
        "/auth/login",
        json={
            "email": "user@example.com",
            "password": "Strongpassword1",
        }
    )

    assert response.status_code == 200
    assert response.json() == {
        "access_token": "test-access-token",
        "token_type": "bearer",
    }

@pytest.mark.asyncio
async def test_login_unknown_user(client: AsyncClient):
    db = AsyncMock(spec=AsyncSession)
    db.scalar.return_value = None
    override_database(db)

    response = await client.post(
        "/auth/login",
        json={
            "email": "user@example.com",
            "password": "Strongpassword1",
        }
    )

    assert response.status_code == 401
    assert response.json() == {
        "detail": "Incorrect email or password",
    }


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch):
    user = User(
            email="user@example.com",
            password_hash="saved_hash",
            birth_date=date(2000, 1, 1),
            is_active=True,
        )

    db = AsyncMock(spec=AsyncSession)
    db.scalar.return_value = user
    override_database(db)

    monkeypatch.setattr(auth_module,
        "verify_password",
        lambda plain_password, hashed_password: False,
    )

    response = await client.post(
        "/auth/login",
        json={
            "email": "user@example.com",
            "password": "Strongpassword1",
        }
    )

    assert response.status_code == 401
    assert response.json() == {
        "detail": "Incorrect email or password",
    }


@pytest.mark.asyncio
async def test_login_inactive_user(client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch):
    user = User(
        email="user@example.com",
        password_hash="saved_hash",
        birth_date=date(2000, 1, 1),
        is_active=False,
    )

    db = AsyncMock(spec=AsyncSession)
    db.scalar.return_value = user
    override_database(db)

    monkeypatch.setattr(auth_module,
        "verify_password",
        lambda plain_password, hashed_password: True,
    )

    response = await client.post(
        "/auth/login",
        json={
            "email": "user@example.com",
            "password": "Strongpassword1",
        }
    )

    assert response.status_code == 403
    assert response.json() == {
        "detail": "User account is inactive",
    }
