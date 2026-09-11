from datetime import date, datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.main import app
from app.models import ClothingItem, User
from app.v1 import clothing_items as items_module


def make_user() -> User:
    user = User(
        email="user@example.com",
        password_hash="not-a-real-hash",
        birth_date=date(2000, 1, 1),
        is_active=True,
    )

    user.id = 1
    return user


def make_item(user_id: int = 1) -> ClothingItem:
    item = ClothingItem(
        name="White shirt",
        category="Tops",
        color="White",
        season="Summer",
        image_key=None,
        user_id=user_id,
    )
    item.id = 10
    item.created_at = datetime.now(timezone.utc)
    item.updated_at = datetime.now(timezone.utc)

    return item


def override_dependencies(db: AsyncSession, user: User) -> None:
    async def override_get_db() -> AsyncSession:
        return db

    async def override_current_user() -> User:
        return user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_active_user] = override_current_user


@pytest.mark.asyncio
async def test_upload_item_image_success(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
):
    user = make_user()
    item = make_item(user.id)

    db = AsyncMock(spec=AsyncSession)
    db.scalar.return_value = item

    upload_mock = MagicMock(return_value="clothing/test-item.png")

    image_url_mock = MagicMock(return_value="http://test/image.png")

    monkeypatch.setattr(items_module, "upload_image", upload_mock)
    monkeypatch.setattr(items_module, "get_image_url", image_url_mock)

    override_dependencies(db, user)

    response = await client.post(
        "items/10/image",
        files={
            "file": (
                "shirt.png",
                b"fake-image-content",
                "image/png",
            )
        },
    )

    assert response.status_code == 200

    response_data = response.json()

    assert response_data["id"] == 10
    assert response_data["image_url"] == "http://test/image.png"
    assert item.image_key == "clothing/test-item.png"

    upload_mock.assert_called_once_with(
        b"fake-image-content",
        "shirt.png",
        "image/png",
    )
    image_url_mock.assert_called_once_with("clothing/test-item.png")

    db.commit.assert_awaited_once()
    db.refresh.assert_awaited_once_with(item)


@pytest.mark.asyncio
async def test_upload_item_image_unsupported_type(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
):
    user = make_user()
    item = make_item(user.id)

    db = AsyncMock(spec=AsyncSession)
    db.scalar.return_value = item

    upload_mock = MagicMock()
    monkeypatch.setattr(
        items_module,
        "upload_image",
        upload_mock,
    )

    override_dependencies(db, user)

    response = await client.post(
        "/items/10/image",
        files={
            "file": (
                "document.txt",
                b"some text",
                "text/plain",
            )
        },
    )

    assert response.status_code == 415
    assert response.json() == {"detail": "Unsupported media type"}

    upload_mock.assert_not_called()
    db.commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_upload_empty_image(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
):
    user = make_user()
    item = make_item(user.id)

    db = AsyncMock(spec=AsyncSession)
    db.scalar.return_value = item

    upload_mock = MagicMock()
    monkeypatch.setattr(
        items_module,
        "upload_image",
        upload_mock,
    )

    override_dependencies(db, user)

    response = await client.post(
        "/items/10/image",
        files={
            "file": (
                "empty.png",
                b"",
                "image/png",
            )
        },
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Empty file"}

    upload_mock.assert_not_called()
    db.commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_upload_image_too_large(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
):
    user = make_user()
    item = make_item(user.id)

    db = AsyncMock(spec=AsyncSession)
    db.scalar.return_value = item

    upload_mock = MagicMock()
    monkeypatch.setattr(
        items_module,
        "upload_image",
        upload_mock,
    )

    override_dependencies(db, user)

    large_content = b"x" * (items_module.MAX_IMAGE_SIZE + 1)

    response = await client.post(
        "/items/10/image",
        files={
            "file": (
                "large.png",
                large_content,
                "image/png",
            )
        },
    )

    assert response.status_code == 413
    assert response.json() == {"detail": "Image too large"}

    upload_mock.assert_not_called()
    db.commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_upload_image_item_not_found(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
):
    user = make_user()

    db = AsyncMock(spec=AsyncSession)
    db.scalar.return_value = None

    upload_mock = MagicMock()
    monkeypatch.setattr(
        items_module,
        "upload_image",
        upload_mock,
    )

    override_dependencies(db, user)

    response = await client.post(
        "/items/999/image",
        files={
            "file": (
                "shirt.png",
                b"fake-image-content",
                "image/png",
            )
        },
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Item not found"}

    upload_mock.assert_not_called()
    db.commit.assert_not_awaited()
