from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from typing import List, Optional
from datetime import datetime, date

from app.models.event import EventCreate, EventResponse
from app.utils.auth import get_current_user_id
from app.database import get_collection

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("/holidays", response_model=List[EventResponse])
async def get_nigerian_holidays(year: Optional[int] = None):
    events_collection = get_collection("events")
    
    if year is None:
        year = datetime.utcnow().year
    
    query = {
        "is_public": True,
        "event_type": "holiday"
    }
    
    events = await events_collection.find(query).sort("date", 1).to_list(length=None)
    
    events = [e for e in events if e["date"].year == year]
    
    return [
        EventResponse(
            id=str(event["_id"]),
            name=event["name"],
            event_type=event["event_type"],
            date=event["date"],
            description=event.get("description"),
            impact_level=event.get("impact_level", "medium"),
            region=event.get("region"),
            is_public=event["is_public"]
        )
        for event in events
    ]


@router.post("/custom", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_custom_event(
    event_data: EventCreate,
    user_id: str = Depends(get_current_user_id)
):
    events_collection = get_collection("events")
    
    event_dict = event_data.model_dump()
    event_dict["user_id"] = ObjectId(user_id)
    event_dict["is_public"] = False
    event_dict["created_at"] = datetime.utcnow()
    
    result = await events_collection.insert_one(event_dict)
    created_event = await events_collection.find_one({"_id": result.inserted_id})
    
    return EventResponse(
        id=str(created_event["_id"]),
        name=created_event["name"],
        event_type=created_event["event_type"],
        date=created_event["date"],
        description=created_event.get("description"),
        impact_level=created_event.get("impact_level", "medium"),
        region=created_event.get("region"),
        is_public=created_event["is_public"]
    )


@router.get("/custom", response_model=List[EventResponse])
async def list_custom_events(user_id: str = Depends(get_current_user_id)):
    events_collection = get_collection("events")
    
    events = await events_collection.find({
        "user_id": ObjectId(user_id),
        "is_public": False
    }).sort("date", 1).to_list(length=None)
    
    return [
        EventResponse(
            id=str(event["_id"]),
            name=event["name"],
            event_type=event["event_type"],
            date=event["date"],
            description=event.get("description"),
            impact_level=event.get("impact_level", "medium"),
            region=event.get("region"),
            is_public=event["is_public"]
        )
        for event in events
    ]


@router.get("/upcoming", response_model=List[EventResponse])
async def get_upcoming_events(
    days: int = 30,
    user_id: str = Depends(get_current_user_id)
):
    events_collection = get_collection("events")
    
    from datetime import timedelta
    end_date = datetime.utcnow().date() + timedelta(days=days)
    
    query = {
        "$or": [
            {"is_public": True},
            {"user_id": ObjectId(user_id)}
        ],
        "date": {
            "$gte": datetime.utcnow().date(),
            "$lte": end_date
        }
    }
    
    events = await events_collection.find(query).sort("date", 1).to_list(length=None)
    
    return [
        EventResponse(
            id=str(event["_id"]),
            name=event["name"],
            event_type=event["event_type"],
            date=event["date"],
            description=event.get("description"),
            impact_level=event.get("impact_level", "medium"),
            region=event.get("region"),
            is_public=event["is_public"]
        )
        for event in events
    ]
