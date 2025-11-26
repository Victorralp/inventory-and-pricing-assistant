from fastapi import APIRouter, HTTPException, status, Depends, Query
from bson import ObjectId
from typing import Optional
from datetime import datetime

from app.utils.auth import get_current_user_id
from app.database import get_collection
from app.ml.forecaster import DemandForecaster

router = APIRouter(prefix="/forecast", tags=["Forecasting"])


@router.post("/demand/{product_id}")
async def forecast_demand(
    product_id: str,
    forecast_days: int = Query(30, ge=7, le=90),
    user_id: str = Depends(get_current_user_id)
):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    products_collection = get_collection("products")
    sales_collection = get_collection("sales")
    events_collection = get_collection("events")
    
    product = await products_collection.find_one({
        "_id": ObjectId(product_id),
        "user_id": ObjectId(user_id)
    })
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    sales = await sales_collection.find({"user_id": ObjectId(user_id)}).to_list(length=None)
    
    events = await events_collection.find({"is_public": True}).to_list(length=None)
    events_list = [
        {
            "date": event["date"].isoformat() if hasattr(event["date"], "isoformat") else str(event["date"]),
            "impact_level": event.get("impact_level", "medium")
        }
        for event in events
    ]
    
    forecaster = DemandForecaster()
    forecast_result = forecaster.forecast_product_demand(
        product_id=product_id,
        sales_data=sales,
        forecast_days=forecast_days,
        events=events_list
    )
    
    return forecast_result


@router.post("/pricing/{product_id}")
async def recommend_pricing(
    product_id: str,
    user_id: str = Depends(get_current_user_id)
):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    products_collection = get_collection("products")
    sales_collection = get_collection("sales")
    
    product = await products_collection.find_one({
        "_id": ObjectId(product_id),
        "user_id": ObjectId(user_id)
    })
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    sales = await sales_collection.find({"user_id": ObjectId(user_id)}).to_list(length=None)
    
    product["id"] = str(product["_id"])
    
    forecaster = DemandForecaster()
    pricing_result = forecaster.optimize_pricing(
        product_data=product,
        sales_data=sales
    )
    
    return pricing_result


@router.get("/reorder-points")
async def get_reorder_points(
    user_id: str = Depends(get_current_user_id),
    lead_time_days: int = Query(7, ge=1, le=30)
):
    products_collection = get_collection("products")
    sales_collection = get_collection("sales")
    events_collection = get_collection("events")
    
    products = await products_collection.find({
        "user_id": ObjectId(user_id),
        "is_active": True
    }).to_list(length=None)
    
    if not products:
        return {"products": [], "message": "No products found"}
    
    sales = await sales_collection.find({"user_id": ObjectId(user_id)}).to_list(length=None)
    events = await events_collection.find({"is_public": True}).to_list(length=None)
    events_list = [
        {
            "date": event["date"].isoformat() if hasattr(event["date"], "isoformat") else str(event["date"]),
            "impact_level": event.get("impact_level", "medium")
        }
        for event in events
    ]
    
    forecaster = DemandForecaster()
    results = []
    
    for product in products:
        product_id = str(product["_id"])
        
        forecast_result = forecaster.forecast_product_demand(
            product_id=product_id,
            sales_data=sales,
            forecast_days=lead_time_days * 2,
            events=events_list
        )
        
        if forecast_result.get("forecast"):
            reorder_info = forecaster.calculate_reorder_point(
                forecast_data=forecast_result,
                lead_time_days=lead_time_days
            )
            
            current_quantity = product.get("quantity", 0)
            reorder_point = reorder_info["reorder_point"]
            
            needs_reorder = current_quantity <= reorder_point
            
            results.append({
                "product_id": product_id,
                "product_name": product["name"],
                "category": product.get("category"),
                "current_quantity": current_quantity,
                "reorder_point": reorder_point,
                "safety_stock": reorder_info["safety_stock"],
                "needs_reorder": needs_reorder,
                "recommended_order_quantity": max(
                    0,
                    reorder_point - current_quantity + reorder_info["safety_stock"]
                ) if needs_reorder else 0,
                "forecast_confidence": forecast_result.get("confidence", "low")
            })
    
    needs_reorder_list = [r for r in results if r["needs_reorder"]]
    
    return {
        "products": results,
        "needs_reorder_count": len(needs_reorder_list),
        "total_products": len(results),
        "needs_reorder": needs_reorder_list
    }


@router.post("/batch-pricing")
async def batch_recommend_pricing(
    user_id: str = Depends(get_current_user_id)
):
    products_collection = get_collection("products")
    sales_collection = get_collection("sales")
    
    products = await products_collection.find({
        "user_id": ObjectId(user_id),
        "is_active": True
    }).to_list(length=None)
    
    if not products:
        return {"products": [], "message": "No products found"}
    
    sales = await sales_collection.find({"user_id": ObjectId(user_id)}).to_list(length=None)
    
    forecaster = DemandForecaster()
    results = []
    
    for product in products:
        product["id"] = str(product["_id"])
        
        pricing_result = forecaster.optimize_pricing(
            product_data=product,
            sales_data=sales
        )
        
        price_diff = pricing_result["recommended_price"] - product.get("selling_price", 0)
        
        results.append({
            "product_id": str(product["_id"]),
            "product_name": product["name"],
            "category": product.get("category"),
            "current_price": product.get("selling_price", 0),
            "recommended_price": pricing_result["recommended_price"],
            "price_difference": round(price_diff, 2),
            "expected_margin_percent": pricing_result["expected_margin_percent"],
            "needs_adjustment": abs(price_diff) > 0.01
        })
    
    needs_adjustment = [r for r in results if r["needs_adjustment"]]
    
    return {
        "products": results,
        "needs_adjustment_count": len(needs_adjustment),
        "total_products": len(results),
        "needs_adjustment": needs_adjustment
    }
