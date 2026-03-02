# How to Login to Your Frontend - Quick Guide

## ✅ Frontend API Fixed!

I've updated your frontend API endpoints to match the Python backend.

---

## Quick Start (2 Steps)

### Step 1: Start Backend
```bash
cd D:\GIT\SK_Nextgen360\Sk-NextGEN360\python_app
python run.py
```

Wait for: `Application starting on port 5000`

### Step 2: Start Frontend
**Open a NEW terminal:**
```bash
cd D:\GIT\SK_Nextgen360\Sk-NextGEN360\Frontend
npm start
```

Browser will open at: `http://localhost:3000/login`

---

## Login Credentials

### Admin Account (Full Access)
- **Email**: `admin@test.com`
- **Password**: `123456`
- **Redirects to**: `/admin` dashboard

### Manager Account
- **Email**: `datamanager@test.com`
- **Password**: Ask me to reset if you don't know it
- **Redirects to**: `/manager` dashboard

### Fresher Accounts
- **Email**: `fresher@test.com` or `franklin@shellkode.com`
- **Password**: Ask me to reset if you don't know it
- **Redirects to**: `/fresher` dashboard

---

## What Happens When You Login

### 1. Enter Credentials
```
Email: admin@test.com
Password: 123456
```

### 2. Click "Sign In"
Frontend sends request to Python backend:
```
POST http://localhost:5000/api/auth/login
```

### 3. Backend Returns Token
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "admin",
  "name": "Admin"
}
```

### 4. Automatic Redirect
- Admin → `/admin`
- Manager → `/manager`
- Fresher → `/fresher`

### 5. Token Saved
Token is stored in browser localStorage and automatically sent with all API requests.

---

## Visual Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. User enters email & password in Login page           │
│    http://localhost:3000/login                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Frontend sends POST to Python backend                │
│    POST http://localhost:5000/api/auth/login            │
│    { email: "admin@test.com", password: "123456" }      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Backend validates & returns JWT token                │
│    { token: "...", role: "admin", name: "Admin" }       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Frontend stores token in localStorage                │
│    localStorage.setItem("token", token)                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Redirect based on role                               │
│    Admin    → http://localhost:3000/admin               │
│    Manager  → http://localhost:3000/manager             │
│    Fresher  → http://localhost:3000/fresher             │
└─────────────────────────────────────────────────────────┘
```

---

## Testing Login

### Option 1: Use the Frontend (Recommended)
1. Make sure backend is running: `python run.py`
2. Start frontend: `npm start`
3. Go to `http://localhost:3000/login`
4. Enter: `admin@test.com` / `123456`
5. Click "Sign In"
6. You should see the admin dashboard ✅

### Option 2: Test API Directly
```bash
# From python_app directory
python test_api.py
```

This will test the login endpoint and show if it's working.

---

## Troubleshooting

### ❌ "Network Error"
**Problem**: Backend not running

**Solution**:
```bash
cd python_app
python run.py
```

### ❌ "Invalid credentials"
**Problem**: Wrong password

**Solution**: Use `admin@test.com` / `123456`

Or reset password:
```bash
cd python_app
python test_login.py
```

### ❌ Login works but nothing happens
**Problem**: JavaScript error in frontend

**Solution**:
1. Open browser console (F12)
2. Look for red errors
3. Check if token is being saved:
   - Open DevTools (F12)
   - Go to Application → Local Storage
   - Check if `token` and `user` are stored

### ❌ "CORS Error"
**Problem**: Backend CORS not configured (shouldn't happen, already configured)

**Solution**: Backend already has CORS enabled. Make sure you're using `http://localhost:5000` not just `localhost:5000`

---

## What You Can Do After Login

### As Admin
- ✅ View all users
- ✅ Create new users (managers/freshers)
- ✅ View dashboard analytics
- ✅ Access all system features

### As Manager
- ✅ Add mock test questions
- ✅ Create tests for freshers
- ✅ View assigned freshers
- ✅ Monitor fresher progress

### As Fresher
- ✅ View assigned tasks
- ✅ Start/complete learning topics
- ✅ Take mock tests
- ✅ Submit simulations
- ✅ Use AI assistant

---

## Next Steps After Login Works

1. ✅ **Login working** - You can access the system
2. 🎨 **Test all features** - Navigate through the UI
3. 📊 **Check dashboards** - View analytics
4. 🚀 **Deploy** - Ready for production when ready

---

## Files Reference

| File | Purpose |
|------|---------|
| `Frontend/src/pages/auth/Login.jsx` | Login UI component |
| `Frontend/src/context/AuthContext.jsx` | Authentication logic |
| `Frontend/src/services/api.js` | API endpoints (FIXED ✅) |
| `python_app/app/routers/auth.py` | Backend login endpoint |

---

## Quick Commands

```bash
# Start Backend
cd python_app && python run.py

# Start Frontend (new terminal)
cd Frontend && npm start

# Test Backend
cd python_app && python test_api.py

# Check Database Users
cd python_app && python test_login.py

# Clear Frontend Cache (if issues)
cd Frontend && rm -rf node_modules package-lock.json && npm install
```

---

## Production Setup

When ready to deploy:

### 1. Build Frontend
```bash
cd Frontend
npm run build
```

### 2. Copy to Backend
```bash
xcopy /E /I build\* ..\python_app\app\static\
```

### 3. Deploy Combined
```bash
cd python_app
docker-compose up -d
```

Now everything runs on port 5000!

---

## Support

- **Backend API Docs**: http://localhost:5000/docs
- **Frontend Guide**: See `/python_app/FRONTEND_INTEGRATION.md`
- **Login Issues**: Run `python test_login.py`
- **API Issues**: Run `python test_api.py`

**Everything is ready! Just start both servers and login!** 🎉

---

## Summary

✅ **What I Fixed**:
1. Updated `/Frontend/src/services/api.js` endpoints
2. Fixed 3 endpoint mismatches (fresher/tasks, mock-test/start, tasks/complete)
3. Everything now matches the Python backend

✅ **What You Need to Do**:
1. Start backend: `cd python_app && python run.py`
2. Start frontend: `cd Frontend && npm start`
3. Login with: `admin@test.com` / `123456`

That's it! Your login should work perfectly now! 🚀
