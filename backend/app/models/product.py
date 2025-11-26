from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from app.models.user import PyObjectId


class ProductBase(BaseModel):
    name: str
    sku: Optional[str] = None
    barcode: Optional[str] = None
    category: str
    description: Optional[str] = None
    cost_price: float = Field(ge=0)
    selling_price: float = Field(ge=0)
    quantity: int = Field(ge=0)
    reorder_point: Optional[int] = None
    unit: str = "piece"
    supplier: Optional[str] = None
    expiry_date: Optional[datetime] = None
    image_url: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    cost_price: Optional[float] = Field(default=None, ge=0)
    selling_price: Optional[float] = Field(default=None, ge=0)
    quantity: Optional[int] = Field(default=None, ge=0)
    reorder_point: Optional[int] = None
    unit: Optional[str] = None
    supplier: Optional[str] = None
    expiry_date: Optional[datetime] = None
    image_url: Optional[str] = None


class Product(ProductBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class ProductResponse(ProductBase):
    id: str
    user_id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True


class ProductWithStats(ProductResponse):
    total_sales: int = 0
    total_revenue: float = 0
    stock_status: str = "normal"
    days_until_expiry: Optional[int] = None
    forecast_demand: Optional[float] = None
    recommended_price: Optional[float] = None
