# AI-Driven Retail Inventory & Pricing Assistant

A full-stack application designed to help small market traders in Nigeria optimize stock levels and pricing. The system reduces losses from over-stocking and under-pricing by forecasting demand based on seasonality, local events, and consumer trends.

## Features

- **User Accounts & Merchant Dashboard**: Sign up, log in, and manage multiple product categories
- **Inventory Management**: Add products, record sales, receive low-stock alerts, barcode/QR code support
- **Demand Forecasting**: ML-powered predictions based on historical data, seasonality, holidays, and local events
- **Pricing Recommendations**: Dynamic pricing suggestions to maximize profit while staying competitive
- **Event & Trend Data**: Nigerian public holidays, school terms, and regional events integration
- **Notifications & Reports**: Weekly email/SMS reports, real-time alerts for critical stock levels
- **Progressive Web App**: Works offline on low-end smartphones

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Progressive Web App (PWA) with offline capabilities
- Tailwind CSS for responsive design
- Recharts for data visualization
- React Query for data fetching

### Backend
- Python FastAPI for REST API
- MongoDB for data storage
- JWT authentication
- Pydantic for data validation

### AI/ML Module
- Prophet for time-series forecasting
- scikit-learn for demand prediction
- Pandas for data preprocessing
- joblib for model persistence

### Notifications
- Brevo/Sendinblue for email
- Africa's Talking / Twilio for SMS/WhatsApp

## Project Structure

```
.
├── backend/              # FastAPI backend application
│   ├── app/
│   │   ├── main.py      # Application entry point
│   │   ├── config.py    # Configuration management
│   │   ├── models/      # Database models
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   ├── ml/          # ML integration
│   │   └── utils/       # Utility functions
│   ├── requirements.txt
│   └── .env.example
├── frontend/            # React PWA frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── context/     # React context
│   │   └── utils/       # Utility functions
│   ├── public/
│   ├── package.json
│   └── .env.example
├── ml_module/           # ML training and prediction
│   ├── train.py         # Model training script
│   ├── predict.py       # Prediction functions
│   ├── data/            # Sample datasets
│   └── models/          # Trained models
└── docs/                # Documentation
```

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- MongoDB 5.0+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Copy `.env.example` to `.env` and configure your environment variables:
```bash
cp .env.example .env
```

5. Run the development server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env` and configure your environment variables:
```bash
cp .env.example .env
```

4. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### ML Module Setup

1. Navigate to the ml_module directory:
```bash
cd ml_module
```

2. Install dependencies (if not already installed from backend):
```bash
pip install -r requirements.txt
```

3. Train the initial model with sample data:
```bash
python train.py
```

## Environment Variables

### Backend (.env)

```env
# MongoDB
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=retail_assistant

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email (Brevo/Sendinblue)
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=noreply@yourapp.com

# SMS (Africa's Talking)
AFRICASTALKING_USERNAME=your-username
AFRICASTALKING_API_KEY=your-api-key
AFRICASTALKING_SENDER=YourApp

# Stripe (for subscriptions)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `GET /api/products/{id}` - Get product details
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Sales
- `POST /api/sales` - Record sale
- `GET /api/sales` - List sales history
- `GET /api/sales/analytics` - Get sales analytics

### Forecasting
- `POST /api/forecast/demand` - Get demand forecast
- `POST /api/forecast/pricing` - Get pricing recommendations
- `GET /api/forecast/reorder-points` - Get reorder point suggestions

### Inventory
- `GET /api/inventory/alerts` - Get low-stock alerts
- `GET /api/inventory/summary` - Get inventory summary

### Events
- `GET /api/events/holidays` - Get Nigerian holidays
- `POST /api/events/custom` - Add custom local event

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

### Backend Deployment (Railway/Render)

1. Set environment variables in your platform
2. Deploy from GitHub repository
3. Ensure MongoDB is accessible
4. Set up scheduled tasks for weekly reports

### Frontend Deployment (Vercel/Netlify)

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

## Features Roadmap

- [ ] Barcode scanner integration with device camera
- [ ] WhatsApp Business API integration
- [ ] Multi-store management
- [ ] Employee role-based access
- [ ] POS hardware integration
- [ ] Competitor price scraping
- [ ] Advanced analytics dashboard
- [ ] Mobile apps (React Native)

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

MIT License - see LICENSE file for details

## Support

For support, email support@yourapp.com or join our WhatsApp community.

## Acknowledgments

- Nigerian traders who provided valuable feedback
- Open-source ML libraries that power the forecasting engine
- Africa's Talking for SMS infrastructure
