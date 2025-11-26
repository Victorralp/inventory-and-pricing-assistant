from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId

from app.models.user import UserCreate, UserResponse, Token
from app.utils.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
)
from app.database import get_collection

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    users_collection = get_collection("users")
    
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user_dict = user_data.model_dump(exclude={"password"})
    user_dict["hashed_password"] = get_password_hash(user_data.password)
    user_dict["is_active"] = True
    user_dict["is_verified"] = False
    user_dict["subscription_tier"] = "free"
    user_dict["subscription_status"] = "trial"
    user_dict["notification_preferences"] = {
        "email": True,
        "sms": False,
        "low_stock_alerts": True,
        "weekly_reports": True,
        "pricing_updates": True
    }
    
    from datetime import datetime
    user_dict["created_at"] = datetime.utcnow()
    user_dict["updated_at"] = datetime.utcnow()
    
    result = await users_collection.insert_one(user_dict)
    created_user = await users_collection.find_one({"_id": result.inserted_id})
    
    return UserResponse(
        id=str(created_user["_id"]),
        email=created_user["email"],
        full_name=created_user["full_name"],
        phone_number=created_user.get("phone_number"),
        business_name=created_user.get("business_name"),
        business_type=created_user.get("business_type"),
        location=created_user.get("location"),
        is_active=created_user["is_active"],
        is_verified=created_user["is_verified"],
        subscription_tier=created_user["subscription_tier"],
        subscription_status=created_user["subscription_status"],
        notification_preferences=created_user["notification_preferences"],
        created_at=created_user["created_at"]
    )


@router.post("/login", response_model=Token)
async def login(email: str, password: str):
    users_collection = get_collection("users")
    
    user = await users_collection.find_one({"email": email})
    if not user or not verify_password(password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    access_token = create_access_token(data={"sub": str(user["_id"])})
    refresh_token = create_refresh_token(data={"sub": str(user["_id"])})
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    token_data = verify_token(token, token_type="refresh")
    
    if not token_data.user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    users_collection = get_collection("users")
    user = await users_collection.find_one({"_id": ObjectId(token_data.user_id)})
    
    if not user or not user["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    access_token = create_access_token(data={"sub": token_data.user_id})
    refresh_token = create_refresh_token(data={"sub": token_data.user_id})
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    token_data = verify_token(token)
    
    users_collection = get_collection("users")
    user = await users_collection.find_one({"_id": ObjectId(token_data.user_id)})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        full_name=user["full_name"],
        phone_number=user.get("phone_number"),
        business_name=user.get("business_name"),
        business_type=user.get("business_type"),
        location=user.get("location"),
        is_active=user["is_active"],
        is_verified=user["is_verified"],
        subscription_tier=user["subscription_tier"],
        subscription_status=user["subscription_status"],
        notification_preferences=user["notification_preferences"],
        created_at=user["created_at"]
    )
