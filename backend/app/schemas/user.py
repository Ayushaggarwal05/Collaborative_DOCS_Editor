from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, model_validator


class UserBase(BaseModel):
    name: str
    email: EmailStr


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    user_id: Optional[int] = None
    email: Optional[EmailStr] = None

    @model_validator(mode="after")
    def check_user_id_or_email(self):
        if self.user_id is None and self.email is None:
            raise ValueError("Either user_id or email must be provided for login")
        return self


class AuthResponse(BaseModel):
    user: UserResponse
    message: str = "Authentication successful"
