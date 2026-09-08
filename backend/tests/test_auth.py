from datetime import date, datetime, timezone
from re import L

import pytest

from httpx import AsyncClient

from app.models import User
from app.core.dependencies import get_current_user
from app.main import app

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
