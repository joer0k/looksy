from datetime import date, datetime, timezone
from re import L
from time import time
from unittest.mock import AsyncMock

import pytest

from httpx import AsyncClient
from sqlalchemy.ext.asyncio.session import AsyncSession

from app.models import User
from app.core.dependencies import get_current_user
from app.main import app
from app.core.database import get_db
from app.v1 import auth as auth_module

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

    response = await client.get("/auth/me", headers={"Authorization": "Test-token"})

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
    
    response = await client.get("/auth/me", headers={"Authorization": "Test-token"})

    assert response.status_code == 403
    assert response.json() == {"detail": "Inactive user"}

@pytest.mark.asyncio
async def test_register(client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch):
    db = AsyncMock(spec=AsyncSession)
    db.scalar.return_value = None

    async def refresh_user(user: User):
        user.id = 1
        user.is_active = True
        user.created_at = datetime.now(timezone.utc)

    db.refresh.side_effect = refresh_user

    async def override_get_db() -> AsyncSession:
        return db

    app.dependency_overrides[get_db] = override_get_db

    monkeypatch.setattr(
        auth_module,
        "hash_password",
        lambda p: "hashed_" + p,
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
