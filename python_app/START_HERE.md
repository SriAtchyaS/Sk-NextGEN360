# START HERE - SK NextGen 360 Python App

## Login Issue FIXED!

The login error has been resolved. The issue was with the bcrypt library compatibility.

## Quick Start (3 Steps)

### Step 1: Start the Server

```bash
cd D:\GIT\SK_Nextgen360\Sk-NextGEN360\python_app
python run.py
```

You should see:
```
Starting SK NextGen 360 Application...
Application starting on port 5000
API Documentation: http://localhost:5000/docs
```

### Step 2: Open API Documentation

Open your browser and go to:
**http://localhost:5000/docs**

### Step 3: Login

1. Find **POST /api/auth/login**
2. Click "Try it out"
3. Use these credentials:
   ```json
   {
     "email": "admin@test.com",
     "password": "123456"
   }
   ```
4. Click "Execute"
5. Copy the token from response
6. Click "Authorize" button (top right)
7. Enter: `Bearer YOUR_TOKEN`
8. Now you can use all endpoints!

---

## Available Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@test.com | 123456 | Admin |
| datamanager@test.com | (existing) | Manager |
| fresher@test.com | (existing) | Fresher |

---

## Testing Scripts

### Test Database & Login
```bash
python test_login.py
```

### Test API (requires server running)
```bash
python test_api.py
```

---

## Common Commands

```bash
# Start server
python run.py

# Start with Docker
docker-compose up -d

# View logs (Docker)
docker-compose logs -f

# Stop Docker
docker-compose down

# Reinstall dependencies
pip install -r requirements.txt
```

---

## File Reference

| File | Purpose |
|------|---------|
| `run.py` | Start the application |
| `test_login.py` | Test database & passwords |
| `test_api.py` | Test API endpoints |
| `LOGIN_CREDENTIALS.md` | Full login documentation |
| `QUICKSTART.md` | Quick start guide |
| `DEPLOYMENT.md` | Deployment instructions |
| `README.md` | Complete documentation |

---

## Troubleshooting

### Server won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Try different port
set PORT=8000
python run.py
```

### Database connection error
- Check `.env` file has correct credentials
- Verify database is accessible
- Test with: `python test_login.py`

### Login fails
- Check credentials match database
- Verify server is running
- Check server logs for errors

### Import errors
```bash
pip install -r requirements.txt --force-reinstall
```

---

## What's New (Fixed)

✅ Bcrypt authentication fixed
✅ Password verification working
✅ All API endpoints functional
✅ JWT token generation working
✅ Role-based access control active

---

## Next Steps

1. ✅ **Server is ready** - Start with `python run.py`
2. 🔐 **Login works** - Use admin@test.com / 123456
3. 🌐 **Test API** - http://localhost:5000/docs
4. 🚀 **Deploy** - Follow DEPLOYMENT.md

---

## Need Help?

- API Docs: http://localhost:5000/docs
- Login Info: See LOGIN_CREDENTIALS.md
- Deployment: See DEPLOYMENT.md
- Full Guide: See README.md

**Everything is ready to go!** 🎉

Start the server and test the login - it should work perfectly now.
