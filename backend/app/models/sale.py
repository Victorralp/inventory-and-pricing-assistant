from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from app.models.user import PyObjectId


class SaleItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int = Field(gt=0)
    unit_price: float = Field(ge=0)
    total_price: float = Field(ge=0)


class SaleBase(BaseModel):
    items: List[SaleItem]
    total_amount: float = Field(ge=0)
    payment_method: str = "cash"
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    notes: Optional[str] = None


class SaleCreate(SaleBase):
    pass


class Sale(SaleBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    sale_date: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class SaleResponse(SaleBase):
    id: str
    user_id: str
    sale_date: datetime
    created_at: datetime

    class Config:
        populate_by_name = True


class SalesAnalytics(BaseModel):
    total_sales: int
    total_revenue: float
    total_profit: float
    average_order_value: float
    top_products: List[dict]
    sales_by_category: dict
    sales_trend: List[dict]
    period_start: datetime
    period_end: datetime
