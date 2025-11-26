from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from bson import ObjectId
from app.models.user import PyObjectId


class EventBase(BaseModel):
    name: str
    event_type: str
    date: date
    description: Optional[str] = None
    impact_level: str = "medium"
    region: Optional[str] = None


class EventCreate(EventBase):
    pass


class Event(EventBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: Optional[PyObjectId] = None
    is_public: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, date: lambda v: v.isoformat()}


class EventResponse(EventBase):
    id: str
    is_public: bool

    class Config:
        populate_by_name = True
        json_encoders = {date: lambda v: v.isoformat()}
