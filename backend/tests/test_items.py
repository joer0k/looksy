from unittest.mock import AsyncMock, MagicMock
from datetime import date, datetime, timezone

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.core.security import create_access_token
from app.main import app
from app.models import User, ClothingItem

def override_database(db: AsyncSession) -> None:
    async def override_get_db() -> AsyncSession:
        return db

    app.dependency_overrides[get_db] = override_get_db

def override_active_user(user: User) -> User:
    async def override_get_current_active_user() -> User:
        return user

    app.dependency_overrides[get_current_active_user] = override_get_current_active_user

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

@pytest.mark.asyncio
async def test_create_item(client: AsyncClient):
    user = User(
        email="user@example.com",
        password_hash="not-a-real-hash",
        birth_date="2000-01-01",
        is_active=True,
    )    
    user.id = 1

    db = AsyncMock(spec=AsyncSession)

    async def refresh_item(item: ClothingItem) -> None:
        item.id = 10
        item.created_at = datetime.now(timezone.utc)
        item.updated_at = datetime.now(timezone.utc)

    db.refresh.side_effect = refresh_item

    override_active_user(user)
    override_database(db)

    response = await client.post(
        "/items/",
        json={"name": "White shirt",
            "category": "Tops",
            "color": "White",
            "season": "Summer",
        },
    )

    assert response.status_code == 201

    response_data = response.json()

    assert response_data["id"] == 10
    assert response_data["name"] == "White shirt"
    assert response_data["category"] == "Tops"
    assert response_data["color"] == "White"
    assert response_data["season"] == "Summer"
    assert response_data["user_id"] == 1
    assert response_data["image_url"] is None
    assert "created_at" in response_data
    assert "updated_at" in response_data

    created_item = db.add.call_args.args[0]

    assert isinstance(created_item, ClothingItem)
    assert created_item.name == "White shirt"
    assert created_item.user_id == user.id

    db.add.assert_called_once_with(created_item)
    db.commit.assert_called_once()
    db.refresh.assert_awaited_once_with(created_item)


@pytest.mark.asyncio
async def test_get_items_returns_user_items(client: AsyncClient):
    user = User(
        email="user@example.com",
        password_hash="not-a-real-hash",
        birth_date=date(2000, 1, 1),
        is_active=True,
    )

    user.id = 1

    item = ClothingItem(
        name="White shirt",
        category="Tops",
        color="White",
        season="Summer",
        user_id=user.id,
        image_key=None,
    )

    item.id = 10
    item.created_at = datetime.now(timezone.utc)
    item.updated_at = datetime.now(timezone.utc)

    db = AsyncMock(spec=AsyncSession)

    items_result = MagicMock()
    items_result.all.return_value = [item]
    db.scalars.return_value = items_result

    override_active_user(user)
    override_database(db)
    response = await client.get("/items/")

    assert response.status_code == 200

    response_data = response.json()

    assert len(response_data) == 1

    returned_item = response_data[0]

    assert returned_item["id"] == 10
    assert returned_item["name"] == "White shirt"
    assert returned_item["category"] == "Tops"
    assert returned_item["color"] == "White"
    assert returned_item["season"] == "Summer"
    assert returned_item["user_id"] == user.id
    assert returned_item["image_url"] is None
    assert "created_at" in returned_item
    assert "updated_at" in returned_item

    db.scalars.assert_awaited_once()

@pytest.mark.asyncio
async def test_get_item_by_id_success(client: AsyncClient):
    user = User(
        email="user@example.com",
        password_hash="not-a-real-hash",
        birth_date=date(2000, 1, 1),
        is_active=True,
    )    
    user.id = 1

    item = ClothingItem(
        name="White shirt",
        category="Tops",
        color="White",
        season="Summer",
        user_id=user.id,
        image_key=None,
    )
    item.id = 10
    item.created_at = datetime.now(timezone.utc)
    item.updated_at = datetime.now(timezone.utc)

    db = AsyncMock(spec=AsyncSession)
    db.scalar.return_value = item

    override_active_user(user)
    override_database(db)

    response = await client.get("/items/10")

    assert response.status_code == 200

    response_data = response.json()

    assert response_data["id"] == 10
    assert response_data["name"] == "White shirt"
    assert response_data["category"] == "Tops"
    assert response_data["color"] == "White"
    assert response_data["season"] == "Summer"
    assert response_data["user_id"] == user.id
    assert response_data["image_url"] is None
    assert "created_at" in response_data
    assert "updated_at" in response_data


@pytest.mark.asyncio
async def test_get_item_by_id_not_found(client: AsyncClient):
    user = User(
        email="user@example.com",
        password_hash="not-a-real-hash",
        birth_date=date(2000, 1, 1),
        is_active=True,
    )
    user.id = 1

    db = AsyncMock(spec=AsyncSession)
    db.scalar.return_value = None

    override_active_user(user)
    override_database(db)

    response = await client.get("/items/999")

    assert response.status_code == 404
    assert response.json() == {
        "detail": "Item not found"
    }

    db.scalar.assert_awaited_once()
    db.commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_update_item_success(client: AsyncClient):
    user = User(
        email="user@example.com",
        password_hash="not-a-real-hash",
        birth_date=date(2000, 1, 1),
        is_active=True,
    )
    user.id = 1

    item = ClothingItem(
        name="White shirt",
        category="Tops",
        color="White",
        season="Summer",
        image_key=None,
        user_id=user.id,
    )
    item.id = 10
    item.created_at = datetime.now(timezone.utc)
    item.updated_at = datetime.now(timezone.utc)

    db = AsyncMock(spec=AsyncSession)
    db.scalar.return_value = item

    override_active_user(user)
    override_database(db)

    response = await client.patch(
        "/items/10",
        json={
            "color": "Black",
        },
    )

    assert response.status_code == 202

    response_data = response.json()

    assert response_data["id"] == 10
    assert response_data["name"] == "White shirt"
    assert response_data["color"] == "Black"

    assert item.color == "Black"
    assert item.name == "White shirt"

    db.commit.assert_awaited_once()
    db.refresh.assert_awaited_once_with(item)

@pytest.mark.asyncio
async def test_update_item_with_empty_data_returns_400(
    client: AsyncClient,
):
    user = User(
        email="user@example.com",
        password_hash="not-a-real-hash",
        birth_date=date(2000, 1, 1),
        is_active=True,
    )
    user.id = 1

    item = ClothingItem(
        name="White shirt",
        category="Tops",
        color="White",
        season="Summer",
        image_key=None,
        user_id=user.id,
    )
    item.id = 10
    item.created_at = datetime.now(timezone.utc)
    item.updated_at = datetime.now(timezone.utc)
    
    db = AsyncMock(spec=AsyncSession)
    db.scalar.return_value = item

    override_active_user(user)
    override_database(db)

    response = await client.patch(
        "/items/10",
        json={},
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": "No data provided for update"
    }

    assert item.name == "White shirt"
    assert item.color == "White"

    db.commit.assert_not_awaited()
    db.refresh.assert_not_awaited()

@pytest.mark.asyncio
async def test_update_item_not_found(client: AsyncClient):
    user = User(
        email="user@example.com",
        password_hash="not-a-real-hash",
        birth_date=date(2000, 1, 1),
        is_active=True,
    )
    user.id = 1

    db = AsyncMock(spec=AsyncSession)
    db.scalar.return_value = None

    override_active_user(user)
    override_database(db)

    response = await client.patch(
        "/items/999",
        json={
            "color": "Black",
        },
    )

    assert response.status_code == 404
    assert response.json() == {
        "detail": "Item not found"
    }

    db.commit.assert_not_awaited()
    db.refresh.assert_not_awaited()

@pytest.mark.asyncio
async def test_delete_item_success(client: AsyncClient):
    user = User(
        email="user@example.com",
        password_hash="not-a-real-hash",
        birth_date=date(2000, 1, 1),
        is_active=True,
    )
    user.id = 1

    item = ClothingItem(
        name="White shirt",
        category="Tops",
        color="White",
        season="Summer",
        image_key=None,
        user_id=user.id,
    )
    item.id = 10

    db = AsyncMock(spec=AsyncSession)
    db.scalar.return_value = item

    override_active_user(user)
    override_database(db)

    response = await client.delete("/items/10")

    assert response.status_code == 204
    assert response.content == b""

    db.delete.assert_awaited_once_with(item)
    db.commit.assert_awaited_once()

@pytest.mark.asyncio
async def test_delete_item_not_found(client: AsyncClient):
    user = User(
        email="user@example.com",
        password_hash="not-a-real-hash",
        birth_date=date(2000, 1, 1),
        is_active=True,
    )
    user.id = 1

    db = AsyncMock(spec=AsyncSession)
    db.scalar.return_value = None

    override_active_user(user)
    override_database(db)

    response = await client.delete("/items/999")

    assert response.status_code == 404
    assert response.json() == {
        "detail": "Item not found"
    }

    db.delete.assert_not_awaited()
    db.commit.assert_not_awaited()

@pytest.mark.asyncio
async def test_get_items_with_category(client: AsyncClient):
    user = User(
        email="user@example.com",
        password_hash="not-a-real-hash",
        birth_date=date(2000, 1, 1),
        is_active=True,
    )
    user.id = 1

    item = ClothingItem(
        id=1,
        name="White shirt",
        category="Tops",
        color="White",
        season="Summer",
        image_key=None,
        user_id=1,
    )
    item.id = 1
    item.created_at = datetime.now(timezone.utc)
    item.updated_at = datetime.now(timezone.utc)

    db = AsyncMock(spec=AsyncSession)

    items_result = MagicMock()
    items_result.all.return_value = [item]
    db.scalars.return_value = items_result

    override_active_user(user)
    override_database(db)
    
    response = await client.get("/items/", params={"category": "Tops"})

    assert response.status_code == 200
    response_data = response.json()

    assert len(response_data) == 1
    assert response_data[0]["id"] == 1
    assert response_data[0]["name"] == "White shirt"
    assert response_data[0]["category"] == "Tops"
    assert response_data[0]["color"] == "White"
    assert response_data[0]["season"] == "Summer"
    assert response_data[0]["user_id"] == 1

    query_parameters = db.scalars.await_args.args[0].compile().params
    assert "Tops" in query_parameters.values()


@pytest.mark.asyncio
async def test_get_items_without_category(client: AsyncClient):
    user = User(
        email="user@example.com",
        password_hash="not-a-real-hash",
        birth_date=date(2000, 1, 1),
        is_active=True,
    )
    user.id = 1

    shirt = ClothingItem(
        name="White shirt",
        category="Tops",
        color="White",
        season="Summer",
        image_key=None,
        user_id=1,
    )
    shirt.id = 10
    shirt.created_at = datetime.now(timezone.utc)
    shirt.updated_at = datetime.now(timezone.utc)

    jeans = ClothingItem(
        name="Blue jeans",
        category="Bottoms",
        color="Blue",
        season="Summer",
        image_key=None,
        user_id=1,
    )
    jeans.id = 11
    jeans.created_at = datetime.now(timezone.utc)
    jeans.updated_at = datetime.now(timezone.utc)

    db = AsyncMock(spec=AsyncSession)

    items_result = MagicMock()
    items_result.all.return_value = [shirt, jeans]
    db.scalars.return_value = items_result

    override_active_user(user)
    override_database(db)

    response = await client.get("/items/")
    assert response.status_code == 200

    response_data = response.json()
    assert len(response_data) == 2
    assert response_data[0]["name"] == "White shirt"
    assert response_data[1]["name"] == "Blue jeans"

@pytest.mark.asyncio
async def test_get_items_with_fake_category(client: AsyncClient):
    user = User(
        email="user@example.com",
        password_hash="not-a-real-hash",
        birth_date=date(2000, 1, 1),
        is_active=True,
    )
    user.id = 1

    db = AsyncMock(spec=AsyncSession)

    items_result = MagicMock()
    items_result.all.return_value = []
    db.scalars.return_value = items_result

    override_active_user(user)
    override_database(db)

    response = await client.get("/items/", params={"category": "fake category"})
    assert response.status_code == 200
    assert response.json() == []

    query_parameters = db.scalars.await_args.args[0].compile().params
    assert "fake category" in query_parameters.values()

@pytest.mark.asyncio
async def test_get_items_query_filters_by_current_user(client: AsyncClient):
    user = User(
        email="user@example.com",
        password_hash="not-a-real-hash",
        birth_date=date(2000, 1, 1),
        is_active=True,
    )
    user.id = 67

    db = AsyncMock(spec=AsyncSession)
    items_result = MagicMock()
    items_result.all.return_value = []
    db.scalars.return_value = items_result

    override_active_user(user)
    override_database(db)

    response = await client.get("/items/")
    assert response.status_code == 200
    assert response.json() == []

    query = db.scalars.await_args.args[0]
    compiled_query = query.compile(compile_kwargs={"literal_binds": True})
    sql = str(compiled_query)
    
    assert f"clothingitems.user_id = {user.id}" in sql