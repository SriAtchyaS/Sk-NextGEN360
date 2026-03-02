# SK NextGen 360 — Frontend

React.js frontend connected to your Node.js + PostgreSQL backend.

## Quick Start

```bash
cd sk-nextgen-360-frontend
npm install
npm start
```

Open: http://localhost:3000

---

## Backend Connection

Edit `.env` to point to your backend:

```
REACT_APP_API_URL=http://localhost:5000/api
```

Your backend must be running on port 5000 (or update the URL above).

---

## API Mapping

| Frontend Action                  | Backend Route                             |
|----------------------------------|-------------------------------------------|
| Login                            | POST /api/auth/login                      |
| Register                         | POST /api/auth/register                   |
| Admin Dashboard                  | GET  /api/admin/dashboard                 |
| Admin Get All Users              | GET  /api/admin/users                     |
| Admin Create User                | POST /api/admin/create-user               |
| Fresher Get Tasks                | GET  /api/fresher/tasks                   |
| Fresher Start Topic              | POST /api/fresher/start-topic             |
| Fresher Complete Topic           | POST /api/fresher/complete-topic          |
| Fresher Calculate Score          | POST /api/fresher/calculate-score         |
| Fresher Submit Simulation        | POST /api/fresher/submit-simulation       |
| Mark Task Complete               | PUT  /api/tasks/complete/:taskId          |
| Manager Add Question             | POST /api/manager/add-question            |
| Manager Get Random Questions     | GET  /api/manager/random-questions        |
| Create Mock Test (20 questions)  | POST /api/mock-test/create                |
| Start Mock Test (10 random Qs)   | GET  /api/mock-test/start/:testId         |
| Submit Mock Test                 | POST /api/mock-test/submit                |
| AI Ask (Gemini)                  | POST /api/ai/ask                          |

---

## Folder Structure

```
src/
├── services/
│   └── api.js             ← All Axios calls + JWT interceptor
├── context/
│   └── AuthContext.jsx    ← Login, logout, user state
├── components/
│   ├── common/index.jsx   ← StatCard, Card, Btn, Badge, Modal, etc.
│   └── layout/Layout.jsx  ← Sidebar + Topbar
└── pages/
    ├── auth/Login.jsx
    ├── admin/
    │   ├── Dashboard.jsx  ← Stats + User table
    │   ├── Users.jsx
    │   └── CreateUser.jsx
    ├── manager/
    │   ├── Dashboard.jsx
    │   ├── AddQuestion.jsx
    │   └── CreateTest.jsx ← AI-powered with Gemini
    └── fresher/
        ├── Dashboard.jsx
        ├── Tasks.jsx      ← Start/Complete topics
        └── MockTest.jsx   ← Full test + AI feedback
```

---

## Role Flow

- **Admin** → Create users → Monitor dashboard
- **Manager** → Add questions → Create test → Share Test ID with freshers
- **Fresher** → Complete tasks → Enter Test ID → Take test → Get AI feedback

---

## JWT Auth

Token stored in `localStorage`. All API calls auto-attach `Authorization: Bearer <token>`.
On 401, user is auto-redirected to `/login`.
