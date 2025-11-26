from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
from app.config import settings

client: Optional[AsyncIOMotorClient] = None


async def connect_to_mongo():
    global client
    client = AsyncIOMotorClient(settings.mongodb_url)
    try:
        await client.admin.command('ping')
        print(f"Connected to MongoDB at {settings.mongodb_url}")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        raise


async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("Closed MongoDB connection")


def get_database():
    if client is None:
        raise Exception("Database not initialized")
    return client[settings.database_name]


def get_collection(collection_name: str):
    db = get_database()
    return db[collection_name]
