# Deployment Guide - SK NextGen 360

Complete guide for deploying the SK NextGen 360 Python application to various platforms.

## Prerequisites

- Docker installed (for containerized deployment)
- Python 3.11+ (for local deployment)
- PostgreSQL database (can use AWS RDS, Google Cloud SQL, or Docker)
- Environment variables configured

## Quick Start (Local Development)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env  # Edit with your values

# 3. Run the application
python run.py
```

Access the application at `http://localhost:5000`

---

## Deployment Options

### 1. Docker Deployment (Recommended)

#### Using Docker Compose (Includes Database)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

#### Using Docker Only (External Database)

```bash
# Build image
docker build -t sk-nextgen360 .

# Run container
docker run -d \
  --name sk-nextgen360 \
  -p 5000:5000 \
  --env-file .env \
  sk-nextgen360
```

---

### 2. Deploy to AWS

#### Option A: AWS ECS/Fargate

1. **Push to ECR**:
```bash
# Authenticate
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.ap-south-1.amazonaws.com

# Build and tag
docker build -t sk-nextgen360 .
docker tag sk-nextgen360:latest YOUR_ACCOUNT.dkr.ecr.ap-south-1.amazonaws.com/sk-nextgen360:latest

# Push
docker push YOUR_ACCOUNT.dkr.ecr.ap-south-1.amazonaws.com/sk-nextgen360:latest
```

2. **Create ECS Task Definition**:
```json
{
  "family": "sk-nextgen360",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "app",
      "image": "YOUR_ACCOUNT.dkr.ecr.ap-south-1.amazonaws.com/sk-nextgen360:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "PORT", "value": "5000"}
      ],
      "secrets": [
        {"name": "DB_HOST", "valueFrom": "arn:aws:secretsmanager:..."},
        {"name": "DB_PASSWORD", "valueFrom": "arn:aws:secretsmanager:..."}
      ]
    }
  ]
}
```

3. **Create ECS Service** via AWS Console or CLI

#### Option B: AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p docker sk-nextgen360

# Create environment
eb create sk-nextgen360-prod

# Deploy
eb deploy
```

---

### 3. Deploy to Google Cloud

#### Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/YOUR_PROJECT/sk-nextgen360

# Deploy to Cloud Run
gcloud run deploy sk-nextgen360 \
  --image gcr.io/YOUR_PROJECT/sk-nextgen360 \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars DB_HOST=...,DB_NAME=... \
  --set-secrets=DB_PASSWORD=db-password:latest
```

---

### 4. Deploy to Azure

#### Azure Container Instances

```bash
# Login
az login

# Create resource group
az group create --name sk-nextgen360-rg --location southindia

# Create container
az container create \
  --resource-group sk-nextgen360-rg \
  --name sk-nextgen360 \
  --image sk-nextgen360:latest \
  --dns-name-label sk-nextgen360 \
  --ports 5000 \
  --environment-variables \
    PORT=5000 \
    DB_HOST=... \
  --secure-environment-variables \
    DB_PASSWORD=...
```

---

### 5. Deploy to Heroku

```bash
# Login
heroku login

# Create app
heroku create sk-nextgen360

# Set environment variables
heroku config:set DB_HOST=...
heroku config:set DB_PASSWORD=...
heroku config:set JWT_SECRET=...

# Deploy with Docker
heroku container:push web
heroku container:release web

# Open app
heroku open
```

---

### 6. Deploy to Digital Ocean

#### App Platform

1. Go to Digital Ocean App Platform
2. Connect your GitHub repository
3. Select `Dockerfile` as build method
4. Configure environment variables
5. Deploy

#### Droplet (VPS)

```bash
# SSH into droplet
ssh root@your-droplet-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone repository
git clone https://github.com/your-repo/sk-nextgen360.git
cd sk-nextgen360/python_app

# Create .env file
nano .env  # Add your configuration

# Run with Docker Compose
docker-compose up -d

# Set up Nginx reverse proxy (optional)
apt install nginx
# Configure Nginx to proxy to localhost:5000
```

---

### 7. Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

---

## Database Setup

### Using AWS RDS (PostgreSQL)

1. Create RDS PostgreSQL instance
2. Configure security groups
3. Update `.env` with RDS endpoint:
```env
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=bug_makers
```

### Using Google Cloud SQL

1. Create Cloud SQL PostgreSQL instance
2. Enable Cloud SQL Admin API
3. Use Cloud SQL Proxy or direct connection

### Using Docker (Development)

```bash
docker run -d \
  --name postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=bug_makers \
  -p 5432:5432 \
  postgres:15-alpine
```

---

## Environment Variables

Required environment variables for production:

```env
# Application
PORT=5000

# Database
DB_HOST=your-database-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=bug_makers

# JWT Authentication
JWT_SECRET=change-this-to-random-secure-string
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# AWS (if using AWS services)
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Email (if using email features)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt with Nginx

```bash
# Install certbot
apt install certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
```

### Using Cloud Provider SSL

- AWS: Use ACM (AWS Certificate Manager) with ALB
- Google Cloud: Managed SSL certificates with Cloud Load Balancing
- Azure: App Service Certificates
- Heroku: Automatic SSL for all apps

---

## Monitoring & Logging

### Application Logs

```bash
# Docker Compose
docker-compose logs -f app

# Docker
docker logs -f sk-nextgen360

# Kubernetes
kubectl logs -f deployment/sk-nextgen360
```

### Monitoring Tools

- **AWS CloudWatch**: For AWS deployments
- **Google Cloud Monitoring**: For GCP deployments
- **Datadog**: Multi-cloud monitoring
- **New Relic**: APM and monitoring
- **Sentry**: Error tracking

---

## Scaling

### Horizontal Scaling

#### Docker Compose
```bash
docker-compose up -d --scale app=3
```

#### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sk-nextgen360
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sk-nextgen360
  template:
    metadata:
      labels:
        app: sk-nextgen360
    spec:
      containers:
      - name: app
        image: sk-nextgen360:latest
        ports:
        - containerPort: 5000
```

---

## Backup & Recovery

### Database Backup

```bash
# PostgreSQL backup
pg_dump -h your-db-host -U your-user -d bug_makers > backup.sql

# Restore
psql -h your-db-host -U your-user -d bug_makers < backup.sql
```

### Automated Backups

- AWS RDS: Enable automated backups
- Google Cloud SQL: Enable automated backups
- Use cron jobs for custom backup scripts

---

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database credentials
   - Verify network connectivity
   - Check security groups/firewall rules

2. **Port Already in Use**
   ```bash
   # Change PORT in .env file
   PORT=8000
   ```

3. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration time

4. **Container Won't Start**
   ```bash
   # Check logs
   docker logs sk-nextgen360
   ```

---

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use HTTPS in production
- [ ] Set up firewall rules
- [ ] Use environment variables for secrets
- [ ] Enable database SSL
- [ ] Implement rate limiting
- [ ] Regular security updates
- [ ] Use secrets manager (AWS Secrets Manager, Google Secret Manager)

---

## Performance Optimization

1. **Database Connection Pooling** - Already configured
2. **Caching** - Implement Redis for frequently accessed data
3. **CDN** - Use CloudFront, Cloud CDN for static assets
4. **Load Balancing** - Use ALB, Cloud Load Balancer
5. **Database Indexing** - Optimize queries with indexes

---

## Support

For deployment issues or questions:
- Check application logs
- Review documentation
- Contact development team

---

**Last Updated**: 2026-03-02
**Version**: 1.0.0
