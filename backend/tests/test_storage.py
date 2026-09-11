from unittest.mock import MagicMock

import pytest
from botocore.exceptions import ClientError

from app.services import storage

def make_client_error(status_code: int) -> ClientError:
    return ClientError(
        error_response={
            "Error": {
                "Code": str(status_code),
                "Message": "Test error",
            },
            "ResponseMetadata": {
                "HTTPStatusCode": status_code,
            },
        },
        operation_name="HeadBucket",
    )


def test_ensure_bucket_when_bucket_exists(
    monkeypatch: pytest.MonkeyPatch,
):
    client = MagicMock()

    monkeypatch.setattr(
        storage,
        "get_s3_client",
        lambda: client,
    )

    storage.ensure_bucket()

    client.head_bucket.assert_called_once_with(Bucket=storage.settings.s3_bucket)

    client.create_bucket.assert_not_called()


def test_ensure_bucket_creates_missing_bucket(
    monkeypatch: pytest.MonkeyPatch,
):
    client = MagicMock()
    client.head_bucket.side_effect = make_client_error(404)

    monkeypatch.setattr(
        storage,
        "get_s3_client",
        lambda: client,
    )

    storage.ensure_bucket()

    client.head_bucket.assert_called_once_with(Bucket=storage.settings.s3_bucket)

    client.create_bucket.assert_called_once_with(Bucket=storage.settings.s3_bucket)

def test_ensure_bucket_reraises_unexpected_error(
    monkeypatch: pytest.MonkeyPatch,
):
    client = MagicMock()
    client.head_bucket.side_effect = make_client_error(403)

    monkeypatch.setattr(
        storage,
        "get_s3_client",
        lambda: client,
    )

    with pytest.raises(ClientError):
        storage.ensure_bucket()

    client.create_bucket.assert_not_called()


def test_upload_image(
    monkeypatch: pytest.MonkeyPatch,
):
    client = MagicMock()
    ensure_bucket_mock = MagicMock()
    monkeypatch.setattr(
        storage,
        "ensure_bucket",
        ensure_bucket_mock,
    )
    monkeypatch.setattr(
        storage,
        "get_s3_client",
        lambda: client,
    )
    monkeypatch.setattr(
        storage.uuid,
        "uuid4",
        lambda: "fixed-id",
    )

    object_key = storage.upload_image(
        content=b"image-content",
        original_filename="PHOTO.PNG",
        content_type="image/png",
    )

    assert object_key == "clothing/fixed-id.png"

    ensure_bucket_mock.assert_called_once()

    client.put_object.assert_called_once_with(
        Bucket=storage.settings.s3_bucket,
        Key="clothing/fixed-id.png",
        Body=b"image-content",
        ContentType="image/png",
    )

def test_get_image_url(
    monkeypatch: pytest.MonkeyPatch,
):
    client = MagicMock()
    client.generate_presigned_url.return_value = (
        "http://test/presigned-image"
    )

    monkeypatch.setattr(
        storage,
        "get_s3_client",
        lambda: client,
    )

    image_url = storage.get_image_url(
        "clothing/test-image.png"
    )

    assert image_url == "http://test/presigned-image"

    client.generate_presigned_url.assert_called_once_with(
        "get_object",
        Params={
            "Bucket": storage.settings.s3_bucket,
            "Key": "clothing/test-image.png",
        },
        ExpiresIn=900,
    )
