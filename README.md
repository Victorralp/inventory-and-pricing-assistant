# Nigeria Property Hub - AI-Powered Property & Mortgage Marketplace

A comprehensive web platform designed to address Nigeria's housing deficit by providing AI-powered property listings, fair rent predictions, and personalized mortgage solutions.

## Features

### 1. Homepage
- Engaging landing page showcasing the platform's mission
- Prominent search bar for property listings
- AI-driven rent prediction highlights
- Featured properties showcase
- Popular locations quick access

### 2. Property Listings
- Comprehensive property listings with high-quality images
- AI-generated fair rent predictions for each property
- Advanced filtering by:
  - Location
  - Price range
  - Property type (apartment, detached, semi-detached, duplex, bungalow)
  - Number of bedrooms
- Favorite properties feature
- Mobile-responsive grid layout

### 3. Property Details
- Detailed property information with image gallery
- AI-powered fair rent predictions with confidence scores
- Property features and amenities
- Inquiry form for contacting agents
- Interactive property overview

### 4. Mortgage Services
- Interactive mortgage calculator
- Mortgage matching tool based on user profile:
  - Monthly income
  - Credit score
  - Employment type
  - Down payment capacity
- Comprehensive list of Nigerian mortgage banks (NMRC, FMBN, GTBank, etc.)
- Interest rates and terms comparison
- Direct application submission

### 5. User Dashboard
- Personalized dashboard with saved properties
- Mortgage application tracking
- Account settings management
- Premium subscription status
- Notification preferences

### 6. Analytics Dashboard (Premium)
- Real-time market trends and insights
- Price trends by location
- Property type distribution
- Demand analysis
- Investment recommendations
- Data-driven insights for property investors

### 7. Contact & Support
- Contact form with email notifications
- FAQ section
- Business hours and location information
- Multiple contact methods (email, phone, office)

### 8. Authentication
- Email/password registration and login
- Google OAuth integration
- Password reset functionality
- Secure user profile management

## Technology Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Zustand** - State management
- **React Helmet Async** - SEO optimization
- **Recharts** - Data visualization
- **React Icons** - Icon library
- **React Hot Toast** - Toast notifications

### Backend
- **FastAPI** - Modern Python web framework
- **SMTP** - Email notifications
- **Python-dotenv** - Environment configuration

### Services
- **Firebase** - Authentication, Firestore database, Storage
- **Cloudinary** - Image hosting and optimization
- **SMTP** - Email delivery (Gmail, SendGrid, etc.)

## Project Structure

```
.
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── PropertyListings.jsx
│   │   │   ├── PropertyDetails.jsx
│   │   │   ├── MortgageServices.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── services/        # API services
│   │   │   ├── authService.js
│   │   │   ├── propertyService.js
│   │   │   ├── mortgageService.js
│   │   │   └── emailService.js
│   │   ├── store/           # State management
│   │   │   ├── authStore.js
│   │   │   └── propertyStore.js
│   │   ├── config/          # Configuration
│   │   │   ├── firebase.js
│   │   │   └── cloudinary.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
├── backend/                 # FastAPI backend
│   ├── app/
│   │   └── main.py         # SMTP email API
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- Firebase account
- Cloudinary account
- SMTP email service (Gmail, SendGrid, etc.)

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Configure your environment variables:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_API_KEY=your_cloudinary_api_key
VITE_CLOUDINARY_UPLOAD_PRESET=property_images

# API Configuration
VITE_API_URL=http://localhost:8000/api
```

5. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```bash
cp .env.example .env
```

5. Configure SMTP settings:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

6. Run the server:
```bash
python -m uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password and Google)
3. Create a Firestore database
4. Enable Storage
5. Add your web app and copy the configuration
6. Update the `.env` file with your Firebase credentials

### Firestore Collections

Create the following collections:

- **users**: User profiles
  ```json
  {
    "uid": "string",
    "email": "string",
    "displayName": "string",
    "isPremium": "boolean",
    "favorites": "array",
    "createdAt": "timestamp"
  }
  ```

- **properties**: Property listings
  ```json
  {
    "title": "string",
    "description": "string",
    "price": "number",
    "location": "string",
    "type": "string",
    "bedrooms": "number",
    "bathrooms": "number",
    "size": "number",
    "images": "array",
    "features": "array",
    "featured": "boolean",
    "createdAt": "timestamp"
  }
  ```

- **mortgageApplications**: Mortgage applications
  ```json
  {
    "userId": "string",
    "bank": "string",
    "amount": "number",
    "status": "string",
    "monthlyIncome": "number",
    "creditScore": "number",
    "createdAt": "timestamp"
  }
  ```

- **mortgageProducts**: Mortgage products
  ```json
  {
    "bank": "string",
    "rate": "number",
    "minIncome": "number",
    "minCreditScore": "number",
    "minDownPayment": "number"
  }
  ```

## Cloudinary Setup

1. Create account at https://cloudinary.com
2. Go to Settings > Upload
3. Create an upload preset named "property_images"
4. Set it to "Unsigned"
5. Update `.env` with your cloud name

## AI Rent Prediction

The platform uses a proprietary algorithm to calculate fair rent predictions based on:

- Property location (premium areas like Ikoyi, Victoria Island)
- Number of bedrooms
- Property type (apartment, detached, semi-detached)
- Property size
- Market trends

The AI provides confidence scores and detailed breakdowns of factors affecting the rent prediction.

## Nigerian Mortgage Banks Integration

The platform features mortgage products from:

- Nigeria Mortgage Refinance Company (NMRC) - 6.5% interest
- Federal Mortgage Bank of Nigeria (FMBN) - 6.0% interest
- First Bank Mortgage - 15.0% interest
- GTBank Mortgage - 14.5% interest
- Access Bank Mortgage - 15.5% interest
- Zenith Bank Mortgage - 14.0% interest
- Stanbic IBTC Mortgage - 16.0% interest
- Union Bank Mortgage - 15.0% interest

## Mobile Responsiveness

The entire platform is fully responsive and optimized for:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## SEO Optimization

- React Helmet Async for meta tags
- Semantic HTML structure
- Optimized images through Cloudinary
- Server-side rendering ready
- Sitemap generation
- Keywords targeting Nigerian property market

## Deployment

### Frontend (Vercel/Netlify)

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add all environment variables
5. Deploy

### Backend (Railway/Render)

1. Connect GitHub repository
2. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Add environment variables
4. Deploy

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting pull requests.

## License

MIT License - see LICENSE file for details

## Support

For support:
- Email: info@nigeriapropertyhub.com
- Phone: +234 800 123 4567
- Website: https://nigeriapropertyhub.com

## Acknowledgments

- Nigerian property market data providers
- Firebase for backend infrastructure
- Cloudinary for image optimization
- The Nigerian real estate community

---

Built with ❤️ to address Nigeria's housing deficit
