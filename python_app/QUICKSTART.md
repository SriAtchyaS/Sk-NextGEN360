# Quick Start Guide - SK NextGen 360 Python App

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies

```bash
cd python_app
pip install -r requirements.txt
```

### Step 2: Configure Environment

The `.env` file is already configured with your database credentials. Verify it's correct:

```bash
cat .env
```

### Step 3: Run the Application

```bash
python run.py
```

**That's it!** Your application is now running at:
- API: http://localhost:5000
- API Docs: http://localhost:5000/docs
- Interactive API: http://localhost:5000/redoc

---

## 📱 Testing the API

### 1. Register a User (via API Docs)

Go to http://localhost:5000/docs and try:

**POST /api/auth/register**
```json
{
  "name": "Test Admin",
  "email": "admin@test.com",
  "password": "password123",
  "role": "admin",
  "department": "IT"
}
```

### 2. Login

**POST /api/auth/login**
```json
{
  "email": "admin@test.com",
  "password": "password123"
}
```

Copy the `token` from the response.

### 3. Use Protected Endpoints

Click "Authorize" button in Swagger UI and paste your token.

Now you can access all protected endpoints!

---

## 🐳 Using Docker (Alternative)

If you prefer Docker:

```bash
# Start everything (app + database)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 📂 Frontend Integration

Your React frontend needs to connect to this backend:

### Update Frontend API Base URL

In your React app, update the API base URL to:

```javascript
// In your React app (e.g., src/services/api.js)
const API_BASE_URL = "http://localhost:5000/api";

// Example: Login function
async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
}
```

### Build Frontend for Production

```bash
cd ../Frontend
npm run build
```

Then copy the build to `python_app/app/static/`:

```bash
cp -r build/* ../python_app/app/static/
```

Now your Python backend will serve the React frontend!

---

## 🎯 Key Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/auth/login` | POST | Login | No |
| `/api/auth/register` | POST | Register | No |
| `/api/admin/users` | GET | Get all users | Admin |
| `/api/manager/my-freshers` | GET | Get my freshers | Manager |
| `/api/fresher/my-tasks` | GET | Get my tasks | Fresher |
| `/api/ai/ask` | POST | Ask AI | Yes |

Full API documentation: http://localhost:5000/docs

---

## 🔧 Common Commands

```bash
# Run in development mode
python run.py

# Run in production mode
uvicorn app.main:app --host 0.0.0.0 --port 5000

# Run with specific port
PORT=8000 python run.py

# Check if server is running
curl http://localhost:5000/test
```

---

## ❓ Troubleshooting

### Database Connection Error
```bash
# Check if database is accessible
psql -h hackathon2.cluster-ctokk08w4mh5.ap-south-1.rds.amazonaws.com -U bug_makers -d bug_makers
```

### Port Already in Use
```bash
# Change port in .env
PORT=8000
```

### Module Not Found Error
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

---

## 📊 Project Status

✅ Backend converted to Python (FastAPI)
✅ All controllers migrated
✅ Authentication system (JWT)
✅ Database connection (PostgreSQL)
✅ AI integration (Gemini)
✅ Deployment ready (Docker)

---

## 🎉 Next Steps

1. **Test All Endpoints**: Use the interactive API docs
2. **Integrate Frontend**: Update React API calls
3. **Deploy**: Follow DEPLOYMENT.md for production deployment
4. **Monitor**: Set up logging and monitoring

---

**Need Help?**
- API Documentation: http://localhost:5000/docs
- Deployment Guide: See DEPLOYMENT.md
- Full README: See README.md
