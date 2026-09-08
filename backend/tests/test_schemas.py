import pytest
import datetime
from pydantic import ValidationError
from dateutil.relativedelta import relativedelta
from app.schemas.auth import UserRegister


def test_register_rejects_invalid_email():
    with pytest.raises(ValidationError):
        UserRegister(email="bademail",
            password="StrongPassword23",
            confirm_password="StrongPassword23",
            birth_date=datetime.date(2000, 1, 1),
            terms_accepted=True,
        )


def test_register_all_valid():
    user = UserRegister(
        email="email@email.com",
        password="StrongPassword23",
        confirm_password="StrongPassword23",
        birth_date=datetime.date(2000, 1, 1),
        terms_accepted=True,
    )
    assert user.email == "email@email.com"
    assert user.password == "StrongPassword23"
    assert user.confirm_password == "StrongPassword23"
    assert user.birth_date == datetime.date(2000, 1, 1)
    assert user.terms_accepted is True

def test_register_short_length_password():
    with pytest.raises(ValidationError):
        UserRegister(
            email="email@email.com",
            password="Strong1",
            confirm_password="Strong1",
            birth_date=datetime.date(2000, 1, 1),
            terms_accepted=True,
        )

def test_register_long_length_password():
    with pytest.raises(ValidationError):
        UserRegister(
            email="email@email.com",
            password="A1" + "a" * 127,
            confirm_password="A1" + "a" * 127,
            birth_date=datetime.date(2000, 1, 1),
            terms_accepted=True,
        )

def test_register_low_register_password():
    with pytest.raises(ValidationError):
        UserRegister(
            email="email@email.com",
            password="strongpassword1",
            confirm_password="strongpassword1",
            birth_date=datetime.date(2000, 1, 1),
            terms_accepted=True,
        )

def test_register_no_number_password():
    with pytest.raises(ValidationError):
        UserRegister(
            email="email@email.com",
            password="Strongpassword",
            confirm_password="Strongpassword",
            birth_date=datetime.date(2000, 1, 1),
            terms_accepted=True,
        )

def test_register_passwords_mismatch():
    with pytest.raises(ValidationError):
        UserRegister(
            email="email@email.com",
            password="Strongpassword1",
            confirm_password="Weakpassword1",
            birth_date=datetime.date(2000, 1, 1),
            terms_accepted=True,
        )

def test_register_user_14_years_old():
    birth_date = datetime.date.today() - relativedelta(years=14)

    user = UserRegister(
        email="email@email.com",
        password="Strongpassword1",
        confirm_password="Strongpassword1",
        birth_date=birth_date,
        terms_accepted=True,
    )

    assert user.email == "email@email.com"
    assert user.password == "Strongpassword1"
    assert user.confirm_password == "Strongpassword1"
    assert user.birth_date == birth_date
    assert user.terms_accepted is True


def test_register_user_14yo_tomorrow():
    with pytest.raises(ValidationError):
        UserRegister(
            email="email@email.com",
            password="Strongpassword1",
            confirm_password="Strongpassword1",
            birth_date=(datetime.date.today() + relativedelta(days=1) - relativedelta(years=14)),
            terms_accepted=True,
        )

def test_register_not_14yo():
    with pytest.raises(ValidationError):
        UserRegister(
            email="email@email.com",
            password="Strongpassword1",
            confirm_password="Strongpassword1",
            birth_date=datetime.date.today(),
            terms_accepted=True,
        )

def test_register_terms_not_accepted():
    with pytest.raises(ValidationError) as exc_info:
        UserRegister(
            email="email@email.com",
            password="Strongpassword1",
            confirm_password="Strongpassword1",
            birth_date=datetime.date(2000, 1, 1),
            terms_accepted=False,
        )
    assert [error["loc"] for error in exc_info.value.errors()] == [("terms_accepted",)]

def test_register_email_empty():
    with pytest.raises(ValidationError) as exc_info:
        UserRegister(
            email="",
            password="Strongpassword1",
            confirm_password="Strongpassword1",
            birth_date=datetime.date(2000, 1, 1),
            terms_accepted=True,
        )
    assert [error["loc"] for error in exc_info.value.errors()] == [("email",)]

def test_register_password_empty():
    with pytest.raises(ValidationError) as exc_info:
        UserRegister(
            email="email@email.com",
            password="",
            confirm_password="Strongpassword1",
            birth_date=datetime.date(2000, 1, 1),
            terms_accepted=True,
        )
    assert [error["loc"] for error in exc_info.value.errors()] == [("password",)]

def test_register_confirm_password_empty():
    with pytest.raises(ValidationError) as exc_info:
        UserRegister(
            email="email@email.com",
            password="Strongpassword1",
            confirm_password="",
            birth_date=datetime.date(2000, 1, 1),
            terms_accepted=True,
        )
    assert [error["loc"] for error in exc_info.value.errors()] == [("confirm_password",)]


def test_register_email_missing():
    with pytest.raises(ValidationError) as exc_info:
        UserRegister(
            password="StrongPassword23",
            confirm_password="StrongPassword23",
            birth_date=datetime.date(2000, 1, 1),
            terms_accepted=True,
        )

    errors = exc_info.value.errors()
    assert len(errors) == 1
    assert errors[0]["loc"] == ("email",)
    assert errors[0]["type"] == "missing"
