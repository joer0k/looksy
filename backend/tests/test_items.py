from unittest.mock import AsyncMock, MagicMock

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import create_access_token
from app.main import app
from app.models import User

@pytest.mark.asyncio
async def test_get_items_without_token_returns_401(client: AsyncClient):
    response = await client.get("/items/")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_items_with_token_returns_200(client: AsyncClient):
    user = User(
        email="user@example.com",
        password_hash="not-a-real-hash",
        birth_date="2000-01-01",
        is_active=True,
    )
    user.id = 1

    db = AsyncMock(spec=AsyncSession)
    db.get.return_value = user

    items_result = MagicMock()
    items_result.all.return_value = []
    db.scalars.return_value = items_result

    async def override_get_db_with_user():
        yield db

    app.dependency_overrides[get_db] = override_get_db_with_user

    token = create_access_token(str(user.id))
    response = await client.get(
        "/items/",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_get_items_with_invalid_token_returns_401(client: AsyncClient):
    response = await client.get("/items/", headers={"Authorization": "Bearer invalid"})
    assert response.status_code == 401
    assert response.json() == {"detail": "Could not validate credentials"}
