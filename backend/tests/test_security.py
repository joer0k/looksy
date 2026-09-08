import jwt
from datetime import datetime, timedelta, timezone

from app.core.config import settings
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token


def test_verify_correct_password():
    password = "StrongPassword1"

    hashed = hash_password(password)

    assert verify_password(password, hashed) is True
    assert hashed != password


def test_verify_incorrect_password():
    password = "StrongPassword1"
    hashed = hash_password(password)

    assert verify_password("WrongPassword", hashed) is False

def test_two_hashed_passwords():
    password = "StrongPassword1"

    hashed1 = hash_password(password)
    hashed2 = hash_password(password)

    assert hashed1 != hashed2
    assert verify_password(password, hashed1) is True
    assert verify_password(password, hashed2) is True


def test_access_token_preserves_subject():
    user_id = "42"

    token = create_access_token(user_id)
    payload = decode_access_token(token)

    assert payload is not None
    assert payload["sub"] == user_id
    assert "exp" in payload


def test_invalid_token():
    token = "invalid_token"
    payload = decode_access_token(token)

    assert payload is None


def test_expired_token():
    payload = {
        "sub": "42",
        "exp": datetime.now(timezone.utc) - timedelta(minutes=1),
    }

    token = jwt.encode(
        payload,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )

    assert decode_access_token(token) is None


def test_token_signed_with_wrong_key():
    payload = {
        "sub": "42",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=5),
    }
    token = jwt.encode(
        payload,
        settings.jwt_secret + "-different-test-key",
        algorithm=settings.jwt_algorithm,
    )

    assert decode_access_token(token) is None
