# Frontend Integration Guide - SK NextGen 360

## Your Frontend is 95% Ready! ✅

Your React frontend is already configured correctly. You just need to:
1. Make sure the backend is running
2. Configure the API URL (optional)
3. Use the correct login credentials

---

## Quick Start

### Step 1: Start Python Backend

```bash
cd D:\GIT\SK_Nextgen360\Sk-NextGEN360\python_app
python run.py
```

Wait for:
```
Application starting on port 5000
```

### Step 2: Start React Frontend

Open a **NEW terminal** and run:

```bash
cd D:\GIT\SK_Nextgen360\Sk-NextGEN360\Frontend
npm start
```

### Step 3: Login

Your browser will open at `http://localhost:3000/login`

**Use these credentials:**
- **Email**: `admin@test.com`
- **Password**: `123456`

That's it! You should be redirected to the admin dashboard.

---

## Frontend Configuration

### API Base URL (Already Configured!)

Your frontend is already set up in `/Frontend/src/services/api.js`:

```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});
```

This automatically connects to your Python backend on port 5000.

### Environment Variable (Optional)

If you want to customize the API URL, create `/Frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

For production:
```env
REACT_APP_API_URL=https://your-domain.com/api
```

---

## How Login Works

### 1. User Enters Credentials

```
Email: admin@test.com
Password: 123456
```

### 2. Frontend Sends Request

Your `Login.jsx` calls:
```javascript
const res = await login(form);
```

Which triggers `AuthContext.jsx`:
```javascript
const { data } = await authAPI.login({ email, password });
```

Which calls your Python backend:
```javascript
POST http://localhost:5000/api/auth/login
{
  "email": "admin@test.com",
  "password": "123456"
}
```

### 3. Backend Returns Token

Python backend (`app/routers/auth.py`) returns:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "admin",
  "name": "Admin"
}
```

### 4. Frontend Stores & Redirects

```javascript
localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(userData));
navigate("/admin"); // Redirects based on role
```

### 5. Protected Routes

All subsequent API calls include the token:
```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## Test Accounts for Different Roles

### Admin
- **Email**: `admin@test.com`
- **Password**: `123456`
- **Redirects to**: `/admin`
- **Can access**: All admin endpoints

### Manager
- **Email**: `datamanager@test.com`
- **Password**: (check with `python test_login.py` or reset)
- **Redirects to**: `/manager`
- **Can access**: Manager endpoints

### Fresher
- **Email**: `fresher@test.com`
- **Password**: (check with `python test_login.py` or reset)
- **Redirects to**: `/fresher`
- **Can access**: Fresher endpoints

---

## API Endpoints (Frontend ↔ Backend)

Your frontend API calls are in `/Frontend/src/services/api.js`. Here's how they map to the Python backend:

### Auth Endpoints ✅
| Frontend | Backend | Status |
|----------|---------|--------|
| `POST /auth/login` | `POST /api/auth/login` | ✅ Working |
| `POST /auth/register` | `POST /api/auth/register` | ✅ Working |

### Admin Endpoints ✅
| Frontend | Backend | Status |
|----------|---------|--------|
| `POST /admin/create-user` | `POST /api/admin/create-user` | ✅ Working |
| `GET /admin/users` | `GET /api/admin/users` | ✅ Working |
| `GET /admin/dashboard` | `GET /api/admin/dashboard` | ✅ Working |

### Manager Endpoints ✅
| Frontend | Backend | Status |
|----------|---------|--------|
| `POST /manager/add-question` | `POST /api/manager/add-question` | ✅ Working |
| `GET /manager/random-questions` | `GET /api/manager/random-questions` | ✅ Working |
| `POST /manager/submit-test` | `POST /api/manager/submit-test` | ✅ Working |
| `GET /manager/my-freshers` | `GET /api/manager/my-freshers` | ✅ Working |

### Fresher Endpoints ⚠️ (Minor Fix Needed)
| Frontend | Backend | Status |
|----------|---------|--------|
| `GET /fresher/tasks` | `GET /api/fresher/my-tasks` | ⚠️ **Update needed** |
| `POST /fresher/start-topic` | `POST /api/fresher/start-topic` | ✅ Working |
| `POST /fresher/complete-topic` | `POST /api/fresher/complete-topic` | ✅ Working |
| `POST /fresher/calculate-score` | `POST /api/fresher/calculate-score` | ✅ Working |
| `POST /fresher/submit-simulation` | `POST /api/fresher/submit-simulation` | ✅ Working |

### Mock Test Endpoints ⚠️ (Minor Fix Needed)
| Frontend | Backend | Status |
|----------|---------|--------|
| `POST /mock-test/create` | `POST /api/mock-test/create` | ✅ Working |
| `GET /mock-test/start/:testId` | `GET /api/mock-test/:testId/start` | ⚠️ **Update needed** |
| `POST /mock-test/submit` | `POST /api/mock-test/submit` | ✅ Working |

### Tasks Endpoints ⚠️ (Minor Fix Needed)
| Frontend | Backend | Status |
|----------|---------|--------|
| `PUT /tasks/complete/:taskId` | `POST /api/tasks/:taskId/complete` | ⚠️ **Update needed** |

### AI Endpoints ✅
| Frontend | Backend | Status |
|----------|---------|--------|
| `POST /ai/ask` | `POST /api/ai/ask` | ✅ Working |

---

## Frontend Updates Needed (3 Small Changes)

Update `/Frontend/src/services/api.js`:

### Change 1: Fresher Tasks Endpoint
```javascript
// OLD:
getMyTasks: () => api.get("/fresher/tasks"),

// NEW:
getMyTasks: () => api.get("/fresher/my-tasks"),
```

### Change 2: Mock Test Start Endpoint
```javascript
// OLD:
start: (testId) => api.get(`/mock-test/start/${testId}`),

// NEW:
start: (testId) => api.get(`/mock-test/${testId}/start`),
```

### Change 3: Task Complete Endpoint
```javascript
// OLD:
markComplete: (taskId) => api.put(`/tasks/complete/${taskId}`),

// NEW:
markComplete: (taskId) => api.post(`/tasks/${taskId}/complete`),
```

---

## Updated api.js File

Here's the complete fixed version:

```javascript
// ─── Fresher  →  /api/fresher ────────────────────────────────────
export const fresherAPI = {
  getMyTasks:         ()     => api.get("/fresher/my-tasks"), // ✅ Fixed
  startTopic:         (data) => api.post("/fresher/start-topic", data),
  completeTopic:      (data) => api.post("/fresher/complete-topic", data),
  calculateScore:     ()     => api.post("/fresher/calculate-score"),
  submitSimulation:   (data) => api.post("/fresher/submit-simulation", data),
};

// ─── Mock Test  →  /api/mock-test ────────────────────────────────
export const mockTestAPI = {
  create: (data)   => api.post("/mock-test/create", data),
  start:  (testId) => api.get(`/mock-test/${testId}/start`), // ✅ Fixed
  submit: (data)   => api.post("/mock-test/submit", data),
};

// ─── Tasks  →  /api/tasks ────────────────────────────────────────
export const taskAPI = {
  markComplete: (taskId) => api.post(`/tasks/${taskId}/complete`), // ✅ Fixed
};
```

---

## Testing Login Flow

### 1. Open Browser Console (F12)

### 2. Watch Network Tab
- Filter by "XHR" or "Fetch"
- You'll see the login request

### 3. Login
- Enter `admin@test.com` / `123456`
- Click "Sign In"

### 4. Check Response
You should see:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "admin",
  "name": "Admin"
}
```

### 5. Check Local Storage
- Open Application tab in DevTools
- Look at Local Storage
- You should see:
  - `token`: JWT token
  - `user`: User object with id, name, role

### 6. Automatic Redirect
- You should be redirected to `/admin` dashboard
- All subsequent API calls will include `Authorization: Bearer TOKEN`

---

## Common Issues & Solutions

### Issue 1: CORS Error
**Error**: "CORS policy: No 'Access-Control-Allow-Origin'"

**Solution**: Python backend already has CORS enabled. Make sure backend is running.

```python
# Already configured in app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue 2: "Network Error" or "Connection Refused"
**Cause**: Backend not running or wrong port

**Solution**:
```bash
# Check if backend is running
curl http://localhost:5000/test

# If not running, start it:
cd python_app
python run.py
```

### Issue 3: "Invalid credentials"
**Cause**: Wrong email/password

**Solution**: Use correct credentials:
- Email: `admin@test.com`
- Password: `123456`

Verify with:
```bash
cd python_app
python test_login.py
```

### Issue 4: Login works but redirects to login again
**Cause**: Token not being stored or invalid

**Solution**: Check browser console for errors. Clear localStorage:
```javascript
// In browser console
localStorage.clear();
// Try logging in again
```

### Issue 5: "401 Unauthorized" on dashboard
**Cause**: Token expired or missing

**Solution**:
- Token expires after 24 hours
- Logout and login again
- Check token is being sent in Authorization header

---

## Testing Different User Roles

### Test Admin Flow
1. Login as: `admin@test.com` / `123456`
2. Should redirect to: `/admin`
3. Can access:
   - View all users
   - Create new users
   - View dashboard statistics

### Test Manager Flow
1. Login as: `datamanager@test.com` / (password)
2. Should redirect to: `/manager`
3. Can access:
   - Add questions
   - Create tests
   - View assigned freshers

### Test Fresher Flow
1. Login as: `fresher@test.com` / (password)
2. Should redirect to: `/fresher`
3. Can access:
   - View tasks
   - Start/complete topics
   - Take mock tests

---

## Production Deployment

### 1. Build Frontend
```bash
cd Frontend
npm run build
```

### 2. Copy Build to Python App
```bash
# Windows
xcopy /E /I build\* ..\python_app\app\static\

# Linux/Mac
cp -r build/* ../python_app/app/static/
```

### 3. Deploy Combined App
```bash
cd python_app
docker-compose up -d
```

Now your React app is served by FastAPI at `http://localhost:5000`

### 4. Update Environment for Production
```env
# Frontend .env.production
REACT_APP_API_URL=https://yourdomain.com/api

# Backend .env
PORT=5000
JWT_SECRET=your-super-secret-production-key
# ... other production settings
```

---

## Debugging Tips

### Enable Request Logging

Add to `/Frontend/src/services/api.js`:
```javascript
// Log all requests
api.interceptors.request.use((config) => {
  console.log('Request:', config.method.toUpperCase(), config.url, config.data);
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Log all responses
api.interceptors.response.use(
  (res) => {
    console.log('Response:', res.status, res.data);
    return res;
  },
  (err) => {
    console.error('Error:', err.response?.status, err.response?.data);
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
```

### Check Backend Logs
```bash
# Watch Python backend logs
cd python_app
python run.py
# Watch for login attempts and errors
```

---

## Summary Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can access login page
- [ ] Login with `admin@test.com` / `123456` works
- [ ] Token stored in localStorage
- [ ] Redirected to `/admin` dashboard
- [ ] Can make authenticated API calls
- [ ] All endpoints working (with 3 minor fixes)

---

## Need Help?

1. **Check if backend is running**: `curl http://localhost:5000/test`
2. **Test login directly**: `python test_api.py`
3. **Check credentials**: `python test_login.py`
4. **View API docs**: http://localhost:5000/docs
5. **Check browser console**: F12 → Console tab
6. **Check network requests**: F12 → Network tab

**Your frontend is ready! Just start both servers and login!** 🚀
