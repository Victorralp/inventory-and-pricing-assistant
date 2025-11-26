from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone_number: Optional[str] = None
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    location: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    location: Optional[str] = None
    notification_preferences: Optional[dict] = None


class User(UserBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    hashed_password: str
    is_active: bool = True
    is_verified: bool = False
    subscription_tier: str = "free"
    subscription_status: str = "trial"
    subscription_expires_at: Optional[datetime] = None
    notification_preferences: dict = {
        "email": True,
        "sms": False,
        "low_stock_alerts": True,
        "weekly_reports": True,
        "pricing_updates": True
    }
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class UserInDB(User):
    pass


class UserResponse(UserBase):
    id: str
    is_active: bool
    is_verified: bool
    subscription_tier: str
    subscription_status: str
    notification_preferences: dict
    created_at: datetime

    class Config:
        populate_by_name = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None
