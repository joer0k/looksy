from datetime import date, datetime
from pydoc import describe

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator, ConfigDict
from sqlalchemy.sql.base import _DefaultDescriptionTuple


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str = Field(..., min_length=8, max_length=128)
    birth_date: date
    terms_accepted: bool

    @field_validator('password')
    @classmethod
    def password_complexity(cls, password: str) -> str:
        if not any(elem.isupper() for elem in password):
            raise ValueError('Password must contain at least 1 uppercase letter')
        if not any(elem.isdigit() for elem in password):
            raise ValueError('Password must contain at least 1 digit')
        return password

    @model_validator(mode='after')
    def passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError('Passwords do not match')
        return self

    @field_validator('birth_date')
    @classmethod
    def valid_age(cls, v: date) -> bool:
        today = date.today()
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 14:
            raise ValueError('Must be at least 14 years old')
        return v


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    birth_date: date
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'