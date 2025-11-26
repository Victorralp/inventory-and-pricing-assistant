# Quick Start Guide

Get your Retail Inventory & Pricing Assistant up and running in 10 minutes!

## Prerequisites

- Python 3.9 or higher
- Node.js 18 or higher
- MongoDB (local or Atlas account)

## Step 1: Clone and Setup

```bash
# The repository is already cloned at /home/engine/project
cd /home/engine/project
```

## Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your MongoDB URL and other settings
# Minimum required: MONGODB_URL and SECRET_KEY
nano .env  # or use your preferred editor
```

**Minimum .env configuration:**
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=retail_assistant
SECRET_KEY=your-secret-key-here-change-this-in-production
```

## Step 3: Seed Sample Data

```bash
# Seed Nigerian holidays
python seed_events.py
```

## Step 4: Start Backend Server

```bash
# From backend directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be running at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative Docs: `http://localhost:8000/redoc`

## Step 5: Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend
cd /home/engine/project/frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# The default values should work for local development
# Edit if needed
nano .env
```

**Default .env.local:**
```env
VITE_API_URL=http://localhost:8000/api
```

## Step 6: Start Frontend

```bash
# From frontend directory
npm run dev
```

The app will be running at `http://localhost:5173`

## Step 7: Create Your First Account

1. Open `http://localhost:5173` in your browser
2. Click "Sign up"
3. Fill in your details:
   - Full Name: John Doe
   - Email: john@example.com
   - Password: password123
   - Business Name: My Store (optional)
   - Location: Lagos, Nigeria (optional)
4. Click "Create Account"
5. Login with your credentials

## Step 8: Add Your First Product

1. Navigate to "Products" in the sidebar
2. Click "+ Add Product"
3. Fill in product details:
   - Name: Rice (50kg bag)
   - Category: Food
   - Cost Price: 25000
   - Selling Price: 35000
   - Quantity: 100
   - Reorder Point: 20
4. Click "Save"

## Step 9: Record Your First Sale

1. Navigate to "Sales"
2. Click "+ Record Sale"
3. Select the product you just created
4. Enter quantity (e.g., 2)
5. Select payment method
6. Click "Record Sale"

## Step 10: Train ML Model (Optional)

```bash
# Navigate to ml_module
cd /home/engine/project/ml_module

# Train initial model with sample data
python train.py
```

## What's Next?

### Explore Features

- **Dashboard**: View sales analytics and inventory summary
- **Forecasting**: Get AI-powered demand forecasts and pricing recommendations
- **Inventory**: Check stock alerts and inventory health
- **Reports**: Analyze sales trends and identify slow-moving products

### Configure Notifications

To enable email and SMS notifications, add these to your backend `.env`:

```env
# Email (Brevo)
BREVO_API_KEY=your-api-key
BREVO_SENDER_EMAIL=noreply@yourdomain.com

# SMS (Africa's Talking)
AFRICASTALKING_USERNAME=your-username
AFRICASTALKING_API_KEY=your-api-key
```

### Customize Events

Add custom local events that affect your business:
1. Navigate to the API docs at `http://localhost:8000/docs`
2. Use the `/api/events/custom` endpoint
3. Or implement a UI for this in the frontend

## Common Issues

### Backend won't start
- **Check MongoDB connection**: Make sure MongoDB is running
- **Port already in use**: Change port in command: `uvicorn app.main:app --port 8001`
- **Module not found**: Activate virtual environment and reinstall dependencies

### Frontend won't start
- **Port already in use**: The app will automatically try a different port
- **API connection error**: Verify backend is running at `http://localhost:8000`

### Database connection error
- **Local MongoDB**: Ensure MongoDB service is running
- **Atlas**: Check IP whitelist and connection string format

## Sample Data

Want to test with sample data? Use the API docs (`/docs`) to:

1. Create multiple products across different categories
2. Record several sales transactions
3. Generate forecasts and pricing recommendations

## API Testing

Use the interactive API documentation:
1. Go to `http://localhost:8000/docs`
2. Click "Authorize" button
3. Login to get access token
4. Paste token in format: `Bearer your-token-here`
5. Test any endpoint

## Mobile Access

The app is a Progressive Web App (PWA):
1. Open on mobile browser: `http://your-computer-ip:5173`
2. It should work responsively
3. For production, deploy to get PWA install prompt

## Need Help?

- **Documentation**: Check `/docs` folder for detailed guides
- **API Reference**: `http://localhost:8000/docs`
- **Issues**: The app logs errors to console
- **Database**: Use MongoDB Compass to inspect data

## Production Deployment

When ready to deploy:
1. Read `docs/DEPLOYMENT_GUIDE.md`
2. Configure production environment variables
3. Use a cloud provider (Railway, Render, Vercel)
4. Set up domain and SSL
5. Configure monitoring and backups

Enjoy building your retail business with AI! 🚀
