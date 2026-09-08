from collections.abc import AsyncIterator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app


async def override_get_db() -> AsyncIterator[None]:
    """Заглушка вместо настоящей сессии БД. В тестах запрос должен
    оканчиваться ошибкой раньше, чем приложение попробует обратиться к БД."""
    yield None


@pytest_asyncio.fixture
async def client() -> AsyncIterator[AsyncClient]:
    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)

    async with AsyncClient(
        transport=transport,
        base_url="http://test"
    ) as client:
        yield client

    app.dependency_overrides.clear()
