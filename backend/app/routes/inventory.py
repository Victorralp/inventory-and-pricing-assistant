from fastapi import APIRouter, Depends
from bson import ObjectId
from datetime import datetime, timedelta
from typing import List

from app.utils.auth import get_current_user_id
from app.database import get_collection

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("/alerts")
async def get_inventory_alerts(user_id: str = Depends(get_current_user_id)):
    products_collection = get_collection("products")
    
    products = await products_collection.find({
        "user_id": ObjectId(user_id),
        "is_active": True
    }).to_list(length=None)
    
    low_stock = []
    out_of_stock = []
    expiring_soon = []
    overstock = []
    
    for product in products:
        product_id = str(product["_id"])
        quantity = product.get("quantity", 0)
        reorder_point = product.get("reorder_point", 0)
        
        if quantity == 0:
            out_of_stock.append({
                "product_id": product_id,
                "product_name": product["name"],
                "category": product.get("category"),
                "quantity": quantity
            })
        elif reorder_point > 0 and quantity <= reorder_point:
            low_stock.append({
                "product_id": product_id,
                "product_name": product["name"],
                "category": product.get("category"),
                "quantity": quantity,
                "reorder_point": reorder_point
            })
        
        if product.get("expiry_date"):
            expiry_date = product["expiry_date"]
            days_until_expiry = (expiry_date - datetime.utcnow()).days
            
            if 0 <= days_until_expiry <= 30:
                expiring_soon.append({
                    "product_id": product_id,
                    "product_name": product["name"],
                    "category": product.get("category"),
                    "expiry_date": expiry_date.isoformat(),
                    "days_until_expiry": days_until_expiry,
                    "quantity": quantity
                })
        
        if reorder_point > 0 and quantity > reorder_point * 3:
            overstock.append({
                "product_id": product_id,
                "product_name": product["name"],
                "category": product.get("category"),
                "quantity": quantity,
                "reorder_point": reorder_point
            })
    
    return {
        "out_of_stock": out_of_stock,
        "out_of_stock_count": len(out_of_stock),
        "low_stock": low_stock,
        "low_stock_count": len(low_stock),
        "expiring_soon": expiring_soon,
        "expiring_soon_count": len(expiring_soon),
        "overstock": overstock,
        "overstock_count": len(overstock),
        "total_alerts": len(out_of_stock) + len(low_stock) + len(expiring_soon) + len(overstock)
    }


@router.get("/summary")
async def get_inventory_summary(user_id: str = Depends(get_current_user_id)):
    products_collection = get_collection("products")
    sales_collection = get_collection("sales")
    
    products = await products_collection.find({
        "user_id": ObjectId(user_id),
        "is_active": True
    }).to_list(length=None)
    
    total_products = len(products)
    total_quantity = sum(p.get("quantity", 0) for p in products)
    total_value = sum(p.get("cost_price", 0) * p.get("quantity", 0) for p in products)
    
    categories = {}
    for product in products:
        category = product.get("category", "Uncategorized")
        if category not in categories:
            categories[category] = {
                "count": 0,
                "quantity": 0,
                "value": 0
            }
        categories[category]["count"] += 1
        categories[category]["quantity"] += product.get("quantity", 0)
        categories[category]["value"] += product.get("cost_price", 0) * product.get("quantity", 0)
    
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_sales = await sales_collection.find({
        "user_id": ObjectId(user_id),
        "sale_date": {"$gte": thirty_days_ago}
    }).to_list(length=None)
    
    product_turnover = {}
    for sale in recent_sales:
        for item in sale.get("items", []):
            pid = item["product_id"]
            if pid not in product_turnover:
                product_turnover[pid] = 0
            product_turnover[pid] += item["quantity"]
    
    slow_moving = []
    fast_moving = []
    
    for product in products:
        pid = str(product["_id"])
        turnover = product_turnover.get(pid, 0)
        
        if turnover == 0 and product.get("quantity", 0) > 0:
            slow_moving.append({
                "product_id": pid,
                "product_name": product["name"],
                "quantity": product.get("quantity", 0),
                "cost_value": product.get("cost_price", 0) * product.get("quantity", 0)
            })
        elif turnover >= 20:
            fast_moving.append({
                "product_id": pid,
                "product_name": product["name"],
                "turnover": turnover,
                "current_quantity": product.get("quantity", 0)
            })
    
    return {
        "total_products": total_products,
        "total_quantity": total_quantity,
        "total_value": round(total_value, 2),
        "categories": categories,
        "slow_moving_products": slow_moving[:10],
        "fast_moving_products": sorted(
            fast_moving,
            key=lambda x: x["turnover"],
            reverse=True
        )[:10],
        "slow_moving_count": len(slow_moving),
        "fast_moving_count": len(fast_moving)
    }
