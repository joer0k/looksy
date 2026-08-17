
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from datetime import date

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str = Field(..., min_length=8, max_length=128)
    birth_date: date
    terms_accepted: bool

    @field_validator('password')
    @classmethod
    def password_complexity(self, password):
        if not any(elem.isupper() for elem in password):
            raise ValueError('Password must contain at least 1 uppercase letter')
        if not any(elem.isdigit() for elem in password):
            raise ValueError('Password must contain at least 1 digit')
        return password

    @model_validator(mode='after')
    def passwords_match(self, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v


    @field_validator('birth_date')
    @classmethod
    def valid_age(self, v):
        today = date.today()
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 14:
            raise ValueError('Must be at least 14 years old')
        return v
