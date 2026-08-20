import uuid
from functools import lru_cache
from pathlib import Path

import boto3
from botocore.exceptions import ClientError

from app.core.config import settings



@lru_cache
def get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint_url,
        aws_access_key_id=settings.s3_access_key,
        aws_secret_access_key=settings.s3_secret_key,
        region_name=settings.s3_region
    )


def ensure_bucket() -> None:
    client = get_s3_client()

    try:
        client.head_bucket(Bucket=settings.s3_bucket)
    except ClientError:
        client.create_bucket(Bucket=settings.s3_bucket)


def upload_image(
        content: bytes,
        original_filename: str,
        content_type: str
) -> str:
    ensure_bucket()

    extension = Path(original_filename).suffix.lower()
    object_key = f"clothing/{uuid.uuid4()}.{extension}"

    get_s3_client().put_object(
        Bucket=settings.s3_bucket,
        Key=object_key,
        Body=content,
        ContentType=content_type
    )

    return object_key