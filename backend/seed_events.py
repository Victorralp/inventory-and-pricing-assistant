import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import date
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "retail_assistant")


nigerian_holidays_2024 = [
    {
        "name": "New Year's Day",
        "event_type": "holiday",
        "date": date(2024, 1, 1),
        "description": "New Year celebration",
        "impact_level": "high",
        "region": "National",
        "is_public": True
    },
    {
        "name": "Good Friday",
        "event_type": "holiday",
        "date": date(2024, 3, 29),
        "description": "Christian holiday commemorating the crucifixion of Jesus",
        "impact_level": "high",
        "region": "National",
        "is_public": True
    },
    {
        "name": "Easter Monday",
        "event_type": "holiday",
        "date": date(2024, 4, 1),
        "description": "Christian holiday celebrating the resurrection of Jesus",
        "impact_level": "high",
        "region": "National",
        "is_public": True
    },
    {
        "name": "Eid al-Fitr",
        "event_type": "holiday",
        "date": date(2024, 4, 10),
        "description": "Islamic holiday marking the end of Ramadan",
        "impact_level": "high",
        "region": "National",
        "is_public": True
    },
    {
        "name": "Workers' Day",
        "event_type": "holiday",
        "date": date(2024, 5, 1),
        "description": "International Workers' Day",
        "impact_level": "medium",
        "region": "National",
        "is_public": True
    },
    {
        "name": "Democracy Day",
        "event_type": "holiday",
        "date": date(2024, 6, 12),
        "description": "Celebrates Nigeria's return to democracy",
        "impact_level": "high",
        "region": "National",
        "is_public": True
    },
    {
        "name": "Eid al-Adha",
        "event_type": "holiday",
        "date": date(2024, 6, 16),
        "description": "Islamic holiday commemorating Abraham's willingness to sacrifice his son",
        "impact_level": "high",
        "region": "National",
        "is_public": True
    },
    {
        "name": "Independence Day",
        "event_type": "holiday",
        "date": date(2024, 10, 1),
        "description": "Celebrates Nigeria's independence from Britain in 1960",
        "impact_level": "high",
        "region": "National",
        "is_public": True
    },
    {
        "name": "Christmas Day",
        "event_type": "holiday",
        "date": date(2024, 12, 25),
        "description": "Christian holiday celebrating the birth of Jesus",
        "impact_level": "high",
        "region": "National",
        "is_public": True
    },
    {
        "name": "Boxing Day",
        "event_type": "holiday",
        "date": date(2024, 12, 26),
        "description": "Day after Christmas",
        "impact_level": "medium",
        "region": "National",
        "is_public": True
    },
]

nigerian_holidays_2025 = [
    {
        "name": "New Year's Day",
        "event_type": "holiday",
        "date": date(2025, 1, 1),
        "description": "New Year celebration",
        "impact_level": "high",
        "region": "National",
        "is_public": True
    },
    {
        "name": "Eid al-Fitr",
        "event_type": "holiday",
        "date": date(2025, 3, 30),
        "description": "Islamic holiday marking the end of Ramadan (approximate)",
        "impact_level": "high",
        "region": "National",
        "is_public": True
    },
    {
        "name": "Good Friday",
        "event_type": "holiday",
        "date": date(2025, 4, 18),
        "description": "Christian holiday commemorating the crucifixion of Jesus",
        "impact_level": "high",
        "region": "National",
        "is_public": True
    },
    {
        "name": "Easter Monday",
        "event_type": "holiday",
        "date": date(2025, 4, 21),
        "description": "Christian holiday celebrating the resurrection of Jesus",
        "impact_level": "high",
        "region": "National",
        "is_public": True
    },
    {
        "name": "Workers' Day",
        "event_type": "holiday",
        "date": date(2025, 5, 1),
        "description": "International Workers' Day",
        "impact_level": "medium",
        "region": "National",
        "is_public": True
    },
    {
        "name": "Eid al-Adha",
        "event_type": "holiday",
        "date": date(2025, 6, 6),
        "description": "Islamic holiday (approximate)",
        "impact_level": "high",
        "region": "National",
        "is_public": True
    },
    {
        "name": "Democracy Day",
        "event_type": "holiday",
        "date": date(2025, 6, 12),
        "description": "Celebrates Nigeria's return to democracy",
        "impact_level": "high",
        "region": "National",
        "is_public": True
    },
    {
        "name": "Independence Day",
        "event_type": "holiday",
        "date": date(2025, 10, 1),
        "description": "Celebrates Nigeria's independence from Britain in 1960",
        "impact_level": "high",
        "region": "National",
        "is_public": True
    },
    {
        "name": "Christmas Day",
        "event_type": "holiday",
        "date": date(2025, 12, 25),
        "description": "Christian holiday celebrating the birth of Jesus",
        "impact_level": "high",
        "region": "National",
        "is_public": True
    },
    {
        "name": "Boxing Day",
        "event_type": "holiday",
        "date": date(2025, 12, 26),
        "description": "Day after Christmas",
        "impact_level": "medium",
        "region": "National",
        "is_public": True
    },
]

local_events = [
    {
        "name": "End of Month (Salary Day)",
        "event_type": "payday",
        "date": date(2024, 12, 31),
        "description": "Increased shopping activity as workers receive salaries",
        "impact_level": "high",
        "region": "National",
        "is_public": True
    },
    {
        "name": "Back to School Season",
        "event_type": "seasonal",
        "date": date(2025, 1, 6),
        "description": "School resumption - increased demand for school supplies",
        "impact_level": "high",
        "region": "National",
        "is_public": True
    },
    {
        "name": "Valentine's Day",
        "event_type": "seasonal",
        "date": date(2025, 2, 14),
        "description": "Increased demand for gifts, flowers, and treats",
        "impact_level": "medium",
        "region": "National",
        "is_public": True
    },
]


async def seed_events():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    events_collection = db["events"]
    
    print(f"Connecting to MongoDB at {MONGODB_URL}")
    print(f"Database: {DATABASE_NAME}")
    
    await events_collection.delete_many({"is_public": True})
    print("Cleared existing public events")
    
    all_events = nigerian_holidays_2024 + nigerian_holidays_2025 + local_events
    
    from datetime import datetime
    for event in all_events:
        event["created_at"] = datetime.utcnow()
    
    result = await events_collection.insert_many(all_events)
    
    print(f"\nSeeded {len(result.inserted_ids)} events:")
    print(f"  - {len(nigerian_holidays_2024)} holidays for 2024")
    print(f"  - {len(nigerian_holidays_2025)} holidays for 2025")
    print(f"  - {len(local_events)} local events")
    
    print("\nSample events:")
    async for event in events_collection.find({"is_public": True}).limit(5):
        print(f"  - {event['name']} ({event['date']})")
    
    client.close()
    print("\nEvent seeding completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed_events())
