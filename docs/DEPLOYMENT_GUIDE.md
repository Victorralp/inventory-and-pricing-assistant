# Deployment Guide

## Prerequisites

- MongoDB instance (Atlas, local, or cloud provider)
- Domain name (optional but recommended)
- Email service account (Brevo)
- SMS service account (Africa's Talking or Twilio)

## Environment Setup

### Production Environment Variables

**Backend (.env)**
```env
# MongoDB
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/retail_assistant?retryWrites=true&w=majority
DATABASE_NAME=retail_assistant

# JWT - Use strong random keys in production
SECRET_KEY=your-very-secure-random-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email (Brevo)
BREVO_API_KEY=your-production-api-key
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME=Retail Assistant

# SMS (Africa's Talking)
AFRICASTALKING_USERNAME=your-username
AFRICASTALKING_API_KEY=your-production-api-key
AFRICASTALKING_SENDER=RetailApp

# Application
ENVIRONMENT=production
API_PREFIX=/api
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Frontend (.env.production)**
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_NAME=Retail Assistant
```

## Deployment Options

### Option 1: Railway (Backend)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Initialize**
   ```bash
   railway login
   cd backend
   railway init
   ```

3. **Add MongoDB**
   ```bash
   railway add
   # Select MongoDB from the list
   ```

4. **Set Environment Variables**
   ```bash
   railway variables set SECRET_KEY=your-secret-key
   railway variables set BREVO_API_KEY=your-api-key
   # Set all other variables
   ```

5. **Deploy**
   ```bash
   railway up
   ```

6. **Custom Domain** (optional)
   ```bash
   railway domain
   ```

### Option 2: Render (Backend)

1. **Create New Web Service**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect GitHub repository

2. **Configure Service**
   - Name: retail-assistant-api
   - Environment: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Add Environment Variables**
   - Click "Environment" tab
   - Add all variables from .env.example

4. **Deploy**
   - Render auto-deploys on git push to main

### Option 3: Docker + DigitalOcean/AWS

**Dockerfile (backend)**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Build and Deploy**
```bash
# Build image
docker build -t retail-assistant-api .

# Push to registry
docker tag retail-assistant-api your-registry/retail-assistant-api:latest
docker push your-registry/retail-assistant-api:latest

# Deploy on server
docker pull your-registry/retail-assistant-api:latest
docker run -d -p 8000:8000 --env-file .env retail-assistant-api:latest
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

3. **Configure**
   - Add environment variables in Vercel dashboard
   - Set build command: `npm run build`
   - Set output directory: `dist`

4. **Custom Domain**
   - Add domain in Vercel dashboard
   - Configure DNS records

### Option 2: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**
   ```bash
   cd frontend
   netlify deploy --prod
   ```

3. **Configure**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add environment variables

### Option 3: AWS S3 + CloudFront

```bash
cd frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create Cluster**
   - Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
   - Create free cluster (M0)
   - Choose region closest to your users

2. **Configure Access**
   - Network Access: Add your server IP or 0.0.0.0/0 (less secure)
   - Database Access: Create user with read/write permissions

3. **Get Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/retail_assistant?retryWrites=true&w=majority
   ```

4. **Seed Data**
   ```bash
   cd backend
   python seed_events.py
   ```

5. **Create Indexes**
   ```javascript
   // In MongoDB Atlas UI or mongosh
   use retail_assistant
   
   db.users.createIndex({ email: 1 }, { unique: true })
   db.products.createIndex({ user_id: 1, is_active: 1 })
   db.products.createIndex({ barcode: 1 })
   db.sales.createIndex({ user_id: 1, sale_date: -1 })
   db.events.createIndex({ date: 1, is_public: 1 })
   ```

## SSL/HTTPS Setup

### Let's Encrypt (Free)

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Reverse Proxy (Nginx)

**nginx.conf**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        root /var/www/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

## Scheduled Tasks

### Weekly Reports with Cron

**crontab**
```cron
# Run every Monday at 9 AM
0 9 * * 1 cd /path/to/backend && /path/to/venv/bin/python scripts/send_weekly_reports.py

# Retrain ML model weekly
0 2 * * 0 cd /path/to/ml_module && /path/to/venv/bin/python train.py
```

## Monitoring & Logging

### Application Monitoring

**Sentry Integration**
```python
# backend/app/main.py
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    environment=settings.environment,
    traces_sample_rate=1.0,
)
```

### Server Monitoring

- **Uptime**: UptimeRobot, Pingdom
- **Performance**: New Relic, Datadog
- **Logs**: Logtail, Papertrail

## Backup Strategy

### Database Backups

**Automated with MongoDB Atlas**
- Enable automatic backups in Atlas
- Configure retention period

**Manual Backups**
```bash
# Backup
mongodump --uri="$MONGODB_URL" --out=/backups/$(date +%Y%m%d)

# Restore
mongorestore --uri="$MONGODB_URL" /backups/20241201
```

### Scheduled Backups
```bash
# Add to crontab
0 2 * * * /usr/local/bin/mongodump --uri="$MONGODB_URL" --out=/backups/$(date +\%Y\%m\%d)
0 3 * * 0 find /backups -type d -mtime +30 -exec rm -rf {} +
```

## Security Checklist

- [ ] Strong SECRET_KEY in production
- [ ] HTTPS enabled
- [ ] Environment variables not in code
- [ ] CORS configured for specific domains
- [ ] MongoDB authentication enabled
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (N/A for MongoDB but still validate)
- [ ] XSS protection
- [ ] CSRF protection for state-changing operations
- [ ] Regular dependency updates
- [ ] Security headers configured

## Performance Optimization

### Backend

1. **Database Indexes** (already configured)
2. **Connection Pooling** (Motor handles this)
3. **Caching** with Redis (optional)
   ```python
   from redis import asyncio as aioredis
   
   redis = await aioredis.from_url("redis://localhost")
   ```

### Frontend

1. **Code Splitting** (Vite handles automatically)
2. **Image Optimization**
3. **CDN for static assets**
4. **Service Worker** (PWA plugin configured)

## Scaling

### Horizontal Scaling

- Deploy multiple backend instances behind load balancer
- Use managed MongoDB (Atlas) for automatic scaling
- CDN for frontend (Vercel/Netlify provide this)

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries
- Add database read replicas

## Troubleshooting

### Common Issues

**Connection Refused**
- Check firewall rules
- Verify MongoDB whitelist includes server IP

**CORS Errors**
- Add frontend domain to CORS_ORIGINS
- Check protocol (http vs https)

**Slow Queries**
- Check database indexes
- Use MongoDB profiler to identify slow queries

**High Memory Usage**
- Limit result set sizes
- Use pagination
- Monitor with process manager (PM2)

## Rollback Strategy

1. **Tag releases** in git
2. **Keep previous deployment** available
3. **Database migrations** must be backward compatible
4. **Quick rollback command**:
   ```bash
   git checkout v1.0.0
   railway up  # or your deployment method
   ```

## Health Checks

**Endpoint**: `GET /health`
```json
{
  "status": "healthy",
  "environment": "production"
}
```

**Monitor with**:
- UptimeRobot (5-minute intervals)
- AWS Route 53 Health Checks
- Custom monitoring script

## Post-Deployment

1. **Test all endpoints** with production data
2. **Monitor logs** for errors
3. **Check performance metrics**
4. **Test mobile responsiveness**
5. **Verify email/SMS delivery**
6. **Test ML predictions** with real data
7. **Create admin user** if needed
8. **Seed initial data** (holidays)

## Support

For deployment issues:
- Check logs: `railway logs` or `heroku logs --tail`
- MongoDB Atlas monitoring dashboard
- Sentry error tracking
- Server metrics (CPU, memory, disk)
