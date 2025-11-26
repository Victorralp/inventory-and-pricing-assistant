from fastapi import APIRouter, HTTPException, status, Depends, Query
from bson import ObjectId
from typing import List, Optional
from datetime import datetime

from app.models.product import ProductCreate, ProductUpdate, ProductResponse, ProductWithStats
from app.utils.auth import get_current_user_id
from app.database import get_collection

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    user_id: str = Depends(get_current_user_id)
):
    products_collection = get_collection("products")
    
    product_dict = product_data.model_dump()
    product_dict["user_id"] = ObjectId(user_id)
    product_dict["is_active"] = True
    product_dict["created_at"] = datetime.utcnow()
    product_dict["updated_at"] = datetime.utcnow()
    
    result = await products_collection.insert_one(product_dict)
    created_product = await products_collection.find_one({"_id": result.inserted_id})
    
    return ProductResponse(
        id=str(created_product["_id"]),
        user_id=str(created_product["user_id"]),
        **{k: v for k, v in created_product.items() if k not in ["_id", "user_id"]}
    )


@router.get("", response_model=List[ProductResponse])
async def list_products(
    user_id: str = Depends(get_current_user_id),
    category: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    products_collection = get_collection("products")
    
    query = {"user_id": ObjectId(user_id), "is_active": True}
    
    if category:
        query["category"] = category
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"sku": {"$regex": search, "$options": "i"}},
            {"barcode": {"$regex": search, "$options": "i"}}
        ]
    
    cursor = products_collection.find(query).skip(skip).limit(limit).sort("created_at", -1)
    products = await cursor.to_list(length=limit)
    
    return [
        ProductResponse(
            id=str(product["_id"]),
            user_id=str(product["user_id"]),
            **{k: v for k, v in product.items() if k not in ["_id", "user_id"]}
        )
        for product in products
    ]


@router.get("/{product_id}", response_model=ProductWithStats)
async def get_product(
    product_id: str,
    user_id: str = Depends(get_current_user_id)
):
    products_collection = get_collection("products")
    sales_collection = get_collection("sales")
    
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    product = await products_collection.find_one({
        "_id": ObjectId(product_id),
        "user_id": ObjectId(user_id)
    })
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    pipeline = [
        {"$match": {"user_id": ObjectId(user_id)}},
        {"$unwind": "$items"},
        {"$match": {"items.product_id": product_id}},
        {
            "$group": {
                "_id": None,
                "total_sales": {"$sum": "$items.quantity"},
                "total_revenue": {"$sum": "$items.total_price"}
            }
        }
    ]
    
    sales_stats = await sales_collection.aggregate(pipeline).to_list(length=1)
    stats = sales_stats[0] if sales_stats else {"total_sales": 0, "total_revenue": 0}
    
    stock_status = "normal"
    if product.get("reorder_point"):
        if product["quantity"] == 0:
            stock_status = "out_of_stock"
        elif product["quantity"] <= product["reorder_point"]:
            stock_status = "low_stock"
    
    days_until_expiry = None
    if product.get("expiry_date"):
        delta = product["expiry_date"] - datetime.utcnow()
        days_until_expiry = delta.days
    
    return ProductWithStats(
        id=str(product["_id"]),
        user_id=str(product["user_id"]),
        total_sales=stats["total_sales"],
        total_revenue=stats["total_revenue"],
        stock_status=stock_status,
        days_until_expiry=days_until_expiry,
        **{k: v for k, v in product.items() if k not in ["_id", "user_id"]}
    )


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    user_id: str = Depends(get_current_user_id)
):
    products_collection = get_collection("products")
    
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    update_data = {k: v for k, v in product_data.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    update_data["updated_at"] = datetime.utcnow()
    
    result = await products_collection.update_one(
        {"_id": ObjectId(product_id), "user_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    updated_product = await products_collection.find_one({"_id": ObjectId(product_id)})
    
    return ProductResponse(
        id=str(updated_product["_id"]),
        user_id=str(updated_product["user_id"]),
        **{k: v for k, v in updated_product.items() if k not in ["_id", "user_id"]}
    )


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    user_id: str = Depends(get_current_user_id)
):
    products_collection = get_collection("products")
    
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    result = await products_collection.update_one(
        {"_id": ObjectId(product_id), "user_id": ObjectId(user_id)},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )


@router.get("/categories/list", response_model=List[str])
async def list_categories(user_id: str = Depends(get_current_user_id)):
    products_collection = get_collection("products")
    
    categories = await products_collection.distinct(
        "category",
        {"user_id": ObjectId(user_id), "is_active": True}
    )
    
    return sorted(categories)
