# Database Schema Documentation

## Collections

### users
Stores user account information and preferences.

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  hashed_password: String (required),
  full_name: String (required),
  phone_number: String,
  business_name: String,
  business_type: String,
  location: String,
  is_active: Boolean (default: true),
  is_verified: Boolean (default: false),
  subscription_tier: String (default: "free"), // "free", "basic", "premium"
  subscription_status: String (default: "trial"), // "trial", "active", "expired"
  subscription_expires_at: Date,
  notification_preferences: {
    email: Boolean (default: true),
    sms: Boolean (default: false),
    low_stock_alerts: Boolean (default: true),
    weekly_reports: Boolean (default: true),
    pricing_updates: Boolean (default: true)
  },
  created_at: Date,
  updated_at: Date
}
```

**Indexes:**
- `email` (unique)
- `subscription_status`

### products
Stores inventory items.

```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: users, required),
  name: String (required),
  sku: String,
  barcode: String,
  category: String (required),
  description: String,
  cost_price: Number (required, >= 0),
  selling_price: Number (required, >= 0),
  quantity: Number (required, >= 0),
  reorder_point: Number,
  unit: String (default: "piece"),
  supplier: String,
  expiry_date: Date,
  image_url: String,
  is_active: Boolean (default: true),
  created_at: Date,
  updated_at: Date
}
```

**Indexes:**
- `user_id, is_active`
- `barcode`
- `sku`
- `category`

### sales
Stores sales transactions.

```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: users, required),
  items: [{
    product_id: String (ref: products._id),
    product_name: String,
    quantity: Number (required, > 0),
    unit_price: Number (required, >= 0),
    total_price: Number (required, >= 0)
  }],
  total_amount: Number (required, >= 0),
  payment_method: String (default: "cash"), // "cash", "card", "transfer"
  customer_name: String,
  customer_phone: String,
  notes: String,
  sale_date: Date (default: now),
  created_at: Date
}
```

**Indexes:**
- `user_id, sale_date` (descending)
- `items.product_id`

### events
Stores holidays and local events for demand forecasting.

```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: users), // null for public events
  name: String (required),
  event_type: String (required), // "holiday", "payday", "seasonal", "festival"
  date: Date (required),
  description: String,
  impact_level: String (default: "medium"), // "low", "medium", "high"
  region: String, // "National", "Lagos", "Abuja", etc.
  is_public: Boolean (default: true),
  created_at: Date
}
```

**Indexes:**
- `date, is_public`
- `user_id`
- `event_type`

## Relationships

### One-to-Many
- **users → products**: One user can have many products
  - Foreign key: `products.user_id` references `users._id`
  
- **users → sales**: One user can have many sales
  - Foreign key: `sales.user_id` references `users._id`
  
- **users → events**: One user can create many custom events
  - Foreign key: `events.user_id` references `users._id`

### Many-to-Many (Embedded)
- **sales ↔ products**: A sale can contain multiple products, and a product can appear in multiple sales
  - Implemented via embedded array: `sales.items[]` contains product references

## Sample Queries

### Get user's low-stock products
```javascript
db.products.find({
  user_id: ObjectId("..."),
  is_active: true,
  $expr: { $lte: ["$quantity", "$reorder_point"] }
})
```

### Get sales in date range with aggregation
```javascript
db.sales.aggregate([
  {
    $match: {
      user_id: ObjectId("..."),
      sale_date: {
        $gte: ISODate("2024-01-01"),
        $lte: ISODate("2024-12-31")
      }
    }
  },
  {
    $group: {
      _id: null,
      total_revenue: { $sum: "$total_amount" },
      total_sales: { $sum: 1 }
    }
  }
])
```

### Top selling products
```javascript
db.sales.aggregate([
  { $match: { user_id: ObjectId("...") } },
  { $unwind: "$items" },
  {
    $group: {
      _id: "$items.product_id",
      product_name: { $first: "$items.product_name" },
      total_quantity: { $sum: "$items.quantity" },
      total_revenue: { $sum: "$items.total_price" }
    }
  },
  { $sort: { total_revenue: -1 } },
  { $limit: 10 }
])
```

### Upcoming events
```javascript
db.events.find({
  $or: [
    { is_public: true },
    { user_id: ObjectId("...") }
  ],
  date: {
    $gte: new Date(),
    $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}).sort({ date: 1 })
```

## Migration Scripts

### Initial Setup
```python
async def init_database():
    db = get_database()
    
    # Create collections with validation
    await db.create_collection("users", validator={
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["email", "hashed_password", "full_name"],
            "properties": {
                "email": {
                    "bsonType": "string",
                    "pattern": "^.+@.+$"
                },
                "subscription_tier": {
                    "enum": ["free", "basic", "premium"]
                }
            }
        }
    })
    
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.products.create_index([("user_id", 1), ("is_active", 1)])
    await db.sales.create_index([("user_id", 1), ("sale_date", -1)])
    await db.events.create_index([("date", 1), ("is_public", 1)])
```

### Seed Nigerian Holidays
See `backend/seed_events.py` for seeding Nigerian public holidays.

## Backup Strategy

### Daily Backups
```bash
# MongoDB dump
mongodump --uri="mongodb://..." --out=/backups/$(date +%Y%m%d)

# Restore from backup
mongorestore --uri="mongodb://..." /backups/20241201
```

### Automated Backups
- Use MongoDB Atlas automated backups
- Or setup cron job:
```cron
0 2 * * * /usr/bin/mongodump --uri="$MONGODB_URL" --out=/backups/$(date +\%Y\%m\%d)
0 3 * * 0 find /backups -type d -mtime +30 -exec rm -rf {} +
```

## Performance Optimization

1. **Use compound indexes** for common query patterns
2. **Limit result sets** with pagination
3. **Use projection** to return only needed fields
4. **Aggregate on the database** instead of in application code
5. **Monitor slow queries** with MongoDB profiler

## Data Retention

- **Sales**: Keep all records (required for ML training)
- **Products**: Soft delete (set `is_active: false`)
- **Users**: Comply with data protection regulations (GDPR, etc.)
- **Events**: Keep public events indefinitely, user events for 2 years

## Security

1. **Enable authentication** on MongoDB
2. **Use strong passwords** for database users
3. **Limit network access** with IP whitelisting
4. **Encrypt data at rest** (MongoDB Atlas provides this)
5. **Use connection string with SSL**
6. **Regular security audits**
