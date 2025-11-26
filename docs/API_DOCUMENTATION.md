# API Documentation

Base URL: `http://localhost:8000/api` (development)

All API endpoints return JSON responses.
Protected endpoints require Bearer token authentication.

## Authentication

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "phone_number": "+234 800 000 0000",
  "business_name": "My Store",
  "location": "Lagos, Nigeria"
}

Response: 201 Created
{
  "id": "...",
  "email": "user@example.com",
  "full_name": "John Doe",
  ...
}
```

### Login
```http
POST /api/auth/login?email=user@example.com&password=securepassword

Response: 200 OK
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

### Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer {refresh_token}

Response: 200 OK
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": "...",
  "email": "user@example.com",
  "full_name": "John Doe",
  "subscription_tier": "free",
  ...
}
```

## Products

### List Products
```http
GET /api/products?category=Electronics&search=phone&skip=0&limit=50
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": "...",
    "name": "Product Name",
    "category": "Electronics",
    "cost_price": 1000,
    "selling_price": 1500,
    "quantity": 50,
    ...
  }
]
```

### Get Product Details
```http
GET /api/products/{product_id}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": "...",
  "name": "Product Name",
  "total_sales": 100,
  "total_revenue": 150000,
  "stock_status": "normal",
  ...
}
```

### Create Product
```http
POST /api/products
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "New Product",
  "sku": "SKU001",
  "category": "Electronics",
  "cost_price": 1000,
  "selling_price": 1500,
  "quantity": 100,
  "reorder_point": 20,
  "unit": "piece"
}

Response: 201 Created
```

### Update Product
```http
PUT /api/products/{product_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "selling_price": 1600,
  "quantity": 80
}

Response: 200 OK
```

### Delete Product
```http
DELETE /api/products/{product_id}
Authorization: Bearer {access_token}

Response: 204 No Content
```

### Get Categories
```http
GET /api/products/categories/list
Authorization: Bearer {access_token}

Response: 200 OK
["Electronics", "Clothing", "Food", ...]
```

## Sales

### Record Sale
```http
POST /api/sales
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "items": [
    {
      "product_id": "...",
      "product_name": "Product A",
      "quantity": 2,
      "unit_price": 1500,
      "total_price": 3000
    }
  ],
  "total_amount": 3000,
  "payment_method": "cash",
  "customer_name": "Jane Doe",
  "customer_phone": "+234 800 000 0000"
}

Response: 201 Created
```

### List Sales
```http
GET /api/sales?start_date=2024-01-01T00:00:00Z&end_date=2024-12-31T23:59:59Z&skip=0&limit=100
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": "...",
    "items": [...],
    "total_amount": 3000,
    "sale_date": "2024-01-15T10:30:00Z",
    ...
  }
]
```

### Get Sales Analytics
```http
GET /api/sales/analytics?days=30
Authorization: Bearer {access_token}

Response: 200 OK
{
  "total_sales": 150,
  "total_revenue": 450000,
  "total_profit": 150000,
  "average_order_value": 3000,
  "top_products": [...],
  "sales_by_category": {...},
  "sales_trend": [...],
  "period_start": "2024-01-01T00:00:00Z",
  "period_end": "2024-01-31T23:59:59Z"
}
```

## Forecasting

### Get Demand Forecast
```http
POST /api/forecast/demand/{product_id}?forecast_days=30
Authorization: Bearer {access_token}

Response: 200 OK
{
  "product_id": "...",
  "forecast": [
    {
      "date": "2024-02-01",
      "predicted_demand": 15.5,
      "lower_bound": 10.2,
      "upper_bound": 20.8
    },
    ...
  ],
  "total_predicted_demand": 465.5,
  "confidence": "high",
  "historical_average": 14.2,
  "message": "Forecast generated successfully"
}
```

### Get Pricing Recommendation
```http
POST /api/forecast/pricing/{product_id}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "recommended_price": 1575.00,
  "min_price": 1380.00,
  "max_price": 2400.00,
  "current_price": 1500.00,
  "expected_margin_percent": 36.51,
  "price_change_percent": 5.00,
  "message": "Pricing optimized based on cost and demand"
}
```

### Get Reorder Points
```http
GET /api/forecast/reorder-points?lead_time_days=7
Authorization: Bearer {access_token}

Response: 200 OK
{
  "products": [
    {
      "product_id": "...",
      "product_name": "Product A",
      "category": "Electronics",
      "current_quantity": 15,
      "reorder_point": 25,
      "safety_stock": 8,
      "needs_reorder": true,
      "recommended_order_quantity": 18,
      "forecast_confidence": "high"
    },
    ...
  ],
  "needs_reorder_count": 5,
  "total_products": 50,
  "needs_reorder": [...]
}
```

### Batch Pricing Recommendations
```http
POST /api/forecast/batch-pricing
Authorization: Bearer {access_token}

Response: 200 OK
{
  "products": [
    {
      "product_id": "...",
      "product_name": "Product A",
      "current_price": 1500,
      "recommended_price": 1575,
      "price_difference": 75,
      "expected_margin_percent": 36.51,
      "needs_adjustment": true
    },
    ...
  ],
  "needs_adjustment_count": 12,
  "total_products": 50,
  "needs_adjustment": [...]
}
```

## Inventory

### Get Inventory Alerts
```http
GET /api/inventory/alerts
Authorization: Bearer {access_token}

Response: 200 OK
{
  "out_of_stock": [
    {
      "product_id": "...",
      "product_name": "Product A",
      "category": "Electronics",
      "quantity": 0
    }
  ],
  "out_of_stock_count": 3,
  "low_stock": [...],
  "low_stock_count": 8,
  "expiring_soon": [...],
  "expiring_soon_count": 2,
  "overstock": [...],
  "overstock_count": 5,
  "total_alerts": 18
}
```

### Get Inventory Summary
```http
GET /api/inventory/summary
Authorization: Bearer {access_token}

Response: 200 OK
{
  "total_products": 150,
  "total_quantity": 5000,
  "total_value": 7500000,
  "categories": {
    "Electronics": {
      "count": 50,
      "quantity": 2000,
      "value": 3000000
    },
    ...
  },
  "slow_moving_products": [...],
  "fast_moving_products": [...],
  "slow_moving_count": 15,
  "fast_moving_count": 25
}
```

## Events

### Get Nigerian Holidays
```http
GET /api/events/holidays?year=2024
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": "...",
    "name": "New Year's Day",
    "event_type": "holiday",
    "date": "2024-01-01",
    "description": "New Year celebration",
    "impact_level": "high",
    "region": "National",
    "is_public": true
  },
  ...
]
```

### Get Upcoming Events
```http
GET /api/events/upcoming?days=30
Authorization: Bearer {access_token}

Response: 200 OK
[...]
```

### Create Custom Event
```http
POST /api/events/custom
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Store Anniversary Sale",
  "event_type": "seasonal",
  "date": "2024-06-15",
  "description": "Annual anniversary sale",
  "impact_level": "high"
}

Response: 201 Created
```

### List Custom Events
```http
GET /api/events/custom
Authorization: Bearer {access_token}

Response: 200 OK
[...]
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid product ID"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 404 Not Found
```json
{
  "detail": "Product not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## Rate Limiting

- **Free tier**: 100 requests per hour
- **Basic tier**: 1000 requests per hour
- **Premium tier**: Unlimited

## Pagination

Most list endpoints support pagination:
- `skip`: Number of records to skip (default: 0)
- `limit`: Maximum number of records to return (default: 100, max: 100)

Example:
```http
GET /api/products?skip=0&limit=50
```

## Interactive Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
