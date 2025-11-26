from fastapi import APIRouter, HTTPException, status, Depends, Query
from bson import ObjectId
from typing import List, Optional
from datetime import datetime, timedelta

from app.models.sale import SaleCreate, SaleResponse, SalesAnalytics
from app.utils.auth import get_current_user_id
from app.database import get_collection

router = APIRouter(prefix="/sales", tags=["Sales"])


@router.post("", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
async def record_sale(
    sale_data: SaleCreate,
    user_id: str = Depends(get_current_user_id)
):
    products_collection = get_collection("products")
    sales_collection = get_collection("sales")
    
    for item in sale_data.items:
        if not ObjectId.is_valid(item.product_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid product ID: {item.product_id}"
            )
        
        product = await products_collection.find_one({
            "_id": ObjectId(item.product_id),
            "user_id": ObjectId(user_id)
        })
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product not found: {item.product_id}"
            )
        
        if product["quantity"] < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {product['name']}"
            )
    
    for item in sale_data.items:
        await products_collection.update_one(
            {"_id": ObjectId(item.product_id)},
            {
                "$inc": {"quantity": -item.quantity},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
    
    sale_dict = sale_data.model_dump()
    sale_dict["user_id"] = ObjectId(user_id)
    sale_dict["sale_date"] = datetime.utcnow()
    sale_dict["created_at"] = datetime.utcnow()
    
    result = await sales_collection.insert_one(sale_dict)
    created_sale = await sales_collection.find_one({"_id": result.inserted_id})
    
    return SaleResponse(
        id=str(created_sale["_id"]),
        user_id=str(created_sale["user_id"]),
        **{k: v for k, v in created_sale.items() if k not in ["_id", "user_id"]}
    )


@router.get("", response_model=List[SaleResponse])
async def list_sales(
    user_id: str = Depends(get_current_user_id),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    sales_collection = get_collection("sales")
    
    query = {"user_id": ObjectId(user_id)}
    
    if start_date or end_date:
        query["sale_date"] = {}
        if start_date:
            query["sale_date"]["$gte"] = start_date
        if end_date:
            query["sale_date"]["$lte"] = end_date
    
    cursor = sales_collection.find(query).skip(skip).limit(limit).sort("sale_date", -1)
    sales = await cursor.to_list(length=limit)
    
    return [
        SaleResponse(
            id=str(sale["_id"]),
            user_id=str(sale["user_id"]),
            **{k: v for k, v in sale.items() if k not in ["_id", "user_id"]}
        )
        for sale in sales
    ]


@router.get("/analytics", response_model=SalesAnalytics)
async def get_sales_analytics(
    user_id: str = Depends(get_current_user_id),
    days: int = Query(30, ge=1, le=365)
):
    sales_collection = get_collection("sales")
    products_collection = get_collection("products")
    
    period_start = datetime.utcnow() - timedelta(days=days)
    period_end = datetime.utcnow()
    
    query = {
        "user_id": ObjectId(user_id),
        "sale_date": {"$gte": period_start, "$lte": period_end}
    }
    
    sales = await sales_collection.find(query).to_list(length=None)
    
    total_sales = len(sales)
    total_revenue = sum(sale["total_amount"] for sale in sales)
    
    product_sales = {}
    category_sales = {}
    total_cost = 0
    
    for sale in sales:
        for item in sale["items"]:
            product_id = item["product_id"]
            if product_id not in product_sales:
                product_sales[product_id] = {
                    "product_name": item["product_name"],
                    "quantity": 0,
                    "revenue": 0
                }
            product_sales[product_id]["quantity"] += item["quantity"]
            product_sales[product_id]["revenue"] += item["total_price"]
            
            product = await products_collection.find_one({"_id": ObjectId(product_id)})
            if product:
                total_cost += product["cost_price"] * item["quantity"]
                category = product.get("category", "Uncategorized")
                category_sales[category] = category_sales.get(category, 0) + item["total_price"]
    
    top_products = sorted(
        [
            {"product_id": pid, **data}
            for pid, data in product_sales.items()
        ],
        key=lambda x: x["revenue"],
        reverse=True
    )[:10]
    
    sales_trend = []
    for i in range(days):
        day_start = period_start + timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        day_sales = [
            sale for sale in sales
            if day_start <= sale["sale_date"] < day_end
        ]
        sales_trend.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "sales": len(day_sales),
            "revenue": sum(sale["total_amount"] for sale in day_sales)
        })
    
    total_profit = total_revenue - total_cost
    average_order_value = total_revenue / total_sales if total_sales > 0 else 0
    
    return SalesAnalytics(
        total_sales=total_sales,
        total_revenue=total_revenue,
        total_profit=total_profit,
        average_order_value=average_order_value,
        top_products=top_products,
        sales_by_category=category_sales,
        sales_trend=sales_trend,
        period_start=period_start,
        period_end=period_end
    )
