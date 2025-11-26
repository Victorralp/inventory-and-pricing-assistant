# Integration Guide

## Notification Services

### Email Integration (Brevo/Sendinblue)

1. **Sign up for Brevo**: Visit [https://www.brevo.com](https://www.brevo.com)
2. **Get API Key**: Navigate to Settings → SMTP & API → API Keys
3. **Configure in `.env`**:
   ```env
   BREVO_API_KEY=your-api-key-here
   BREVO_SENDER_EMAIL=noreply@yourdomain.com
   BREVO_SENDER_NAME=Retail Assistant
   ```

4. **Implement Email Service** (already included in `backend/app/services/notification.py`):
   ```python
   import httpx
   
   async def send_email(to_email, subject, html_content):
       headers = {
           "api-key": settings.brevo_api_key,
           "Content-Type": "application/json"
       }
       payload = {
           "sender": {
               "name": settings.brevo_sender_name,
               "email": settings.brevo_sender_email
           },
           "to": [{"email": to_email}],
           "subject": subject,
           "htmlContent": html_content
       }
       async with httpx.AsyncClient() as client:
           response = await client.post(
               "https://api.brevo.com/v3/smtp/email",
               json=payload,
               headers=headers
           )
       return response.status_code == 201
   ```

### SMS Integration (Africa's Talking)

1. **Sign up**: Visit [https://africastalking.com](https://africastalking.com)
2. **Create App**: Create a new application in the dashboard
3. **Get Credentials**: Note your username and API key
4. **Configure in `.env`**:
   ```env
   AFRICASTALKING_USERNAME=your-username
   AFRICASTALKING_API_KEY=your-api-key
   AFRICASTALKING_SENDER=YourAppName
   ```

5. **Install SDK**:
   ```bash
   pip install africastalking
   ```

6. **Implement SMS Service**:
   ```python
   import africastalking
   
   africastalking.initialize(
       username=settings.africastalking_username,
       api_key=settings.africastalking_api_key
   )
   sms = africastalking.SMS
   
   async def send_sms(phone_number, message):
       try:
           response = sms.send(message, [phone_number])
           return response['SMSMessageData']['Recipients'][0]['status'] == 'Success'
       except Exception as e:
           print(f"SMS Error: {e}")
           return False
   ```

### Alternative SMS (Twilio)

1. **Sign up**: Visit [https://www.twilio.com](https://www.twilio.com)
2. **Get Credentials**: Account SID, Auth Token, and Phone Number
3. **Configure in `.env`**:
   ```env
   TWILIO_ACCOUNT_SID=your-account-sid
   TWILIO_AUTH_TOKEN=your-auth-token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

4. **Install SDK**:
   ```bash
   pip install twilio
   ```

## Payment Integration (Stripe)

### Setup

1. **Create Account**: Visit [https://stripe.com](https://stripe.com)
2. **Get API Keys**: Dashboard → Developers → API Keys
3. **Configure in `.env`**:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Subscription Implementation

```python
import stripe
stripe.api_key = settings.stripe_secret_key

# Create a subscription
async def create_subscription(user_id, price_id):
    customer = stripe.Customer.create(
        email=user.email,
        metadata={"user_id": user_id}
    )
    
    subscription = stripe.Subscription.create(
        customer=customer.id,
        items=[{"price": price_id}],
        payment_behavior="default_incomplete",
        expand=["latest_invoice.payment_intent"]
    )
    
    return subscription
```

## POS Hardware Integration

### Barcode Scanner

Most USB barcode scanners work as keyboard input devices. No special integration needed:

```javascript
// Frontend - Listen for barcode input
const [barcode, setBarcode] = useState('')

useEffect(() => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && barcode) {
      searchProductByBarcode(barcode)
      setBarcode('')
    } else {
      setBarcode(prev => prev + e.key)
    }
  }
  
  window.addEventListener('keypress', handleKeyPress)
  return () => window.removeEventListener('keypress', handleKeyPress)
}, [barcode])
```

### Receipt Printer

Use browser printing API or ESC/POS protocol:

```javascript
// Generate receipt HTML and print
const printReceipt = (sale) => {
  const receiptWindow = window.open('', 'Receipt', 'width=300,height=600')
  receiptWindow.document.write(`
    <html>
      <head><title>Receipt</title></head>
      <body>
        <h2>Receipt</h2>
        <p>Date: ${new Date().toLocaleDateString()}</p>
        <!-- Add sale items -->
        <p>Total: ₦${sale.total_amount}</p>
      </body>
    </html>
  `)
  receiptWindow.document.close()
  receiptWindow.print()
}
```

## Database Indexing

Add indexes for better performance:

```python
# Run after initial setup
async def create_indexes():
    db = get_database()
    
    # Products
    await db.products.create_index([("user_id", 1), ("is_active", 1)])
    await db.products.create_index([("barcode", 1)])
    await db.products.create_index([("sku", 1)])
    
    # Sales
    await db.sales.create_index([("user_id", 1), ("sale_date", -1)])
    
    # Events
    await db.events.create_index([("date", 1), ("is_public", 1)])
```

## Scheduled Tasks

### Weekly Reports (using APScheduler)

```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()

@scheduler.scheduled_job('cron', day_of_week='mon', hour=9)
async def send_weekly_reports():
    users = await get_all_active_users()
    for user in users:
        if user.notification_preferences.get('weekly_reports'):
            report = await generate_weekly_report(user.id)
            await send_email(user.email, "Weekly Report", report)

scheduler.start()
```

## Deployment

### Backend (Railway/Render)

1. Connect GitHub repository
2. Set environment variables
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)

1. Connect GitHub repository
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add environment variables

### Database (MongoDB Atlas)

1. Create cluster
2. Whitelist IP addresses
3. Get connection string
4. Update `MONGODB_URL` in backend `.env`

## Security Best Practices

1. **Never commit `.env` files**
2. **Use HTTPS in production**
3. **Implement rate limiting**
4. **Validate all user inputs**
5. **Use strong JWT secrets**
6. **Regularly update dependencies**
7. **Enable CORS only for trusted origins**
8. **Use environment-specific configurations**

## Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Monitoring

### Sentry Integration

```python
import sentry_sdk
sentry_sdk.init(dsn="your-sentry-dsn")
```

### Health Checks

Already implemented at `/health` endpoint. Monitor with:
- UptimeRobot
- Pingdom
- StatusCake
