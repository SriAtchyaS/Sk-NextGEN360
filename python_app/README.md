# SK NextGen 360 - Python Application

A unified Python-based full-stack application for SK NextGen 360, built with FastAPI backend.

## Features

- **Unified Authentication**: Single login system for all users (Admin, Manager, Fresher)
- **Role-Based Access Control**: Separate endpoints for different user roles
- **RESTful API**: Clean and well-documented API endpoints
- **Database Integration**: PostgreSQL with connection pooling
- **AI Integration**: Gemini AI for intelligent assistance
- **Mock Tests**: Create and manage assessment tests
- **Task Management**: Track and manage learning tasks
- **Performance Analytics**: Dashboard with performance metrics

## Tech Stack

- **Backend**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **AI**: Google Gemini API
- **Deployment**: Docker & Docker Compose

## Project Structure

```
python_app/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── database.py          # Database connection and utilities
│   ├── auth/
│   │   ├── jwt_handler.py   # JWT token management
│   │   └── dependencies.py  # Auth dependencies
│   ├── routers/
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── admin.py         # Admin endpoints
│   │   ├── manager.py       # Manager endpoints
│   │   ├── fresher.py       # Fresher endpoints
│   │   ├── tasks.py         # Task management
│   │   ├── ai.py            # AI integration
│   │   └── mock_test.py     # Mock test management
│   ├── static/              # Frontend build (React)
│   └── uploads/             # File uploads
├── .env                     # Environment variables
├── requirements.txt         # Python dependencies
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose setup
└── README.md               # This file
```

## Installation

### Option 1: Using Docker (Recommended)

1. Clone the repository
2. Navigate to the python_app directory
3. Make sure `.env` file is configured
4. Run with Docker Compose:

```bash
docker-compose up -d
```

The application will be available at `http://localhost:5000`

### Option 2: Local Development

1. **Prerequisites**:
   - Python 3.11+
   - PostgreSQL database
   - pip

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Configure environment**:
   - Copy `.env.example` to `.env` (if exists) or use the existing `.env`
   - Update database credentials and API keys

4. **Run the application**:
```bash
python -m app.main
# or
uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Admin
- `POST /api/admin/create-user` - Create manager/fresher
- `GET /api/admin/users` - Get all users
- `GET /api/admin/dashboard` - Admin dashboard statistics

### Manager
- `POST /api/manager/add-question` - Add mock test question
- `GET /api/manager/random-questions` - Get random questions
- `POST /api/manager/submit-test` - Submit mock test
- `GET /api/manager/my-freshers` - Get assigned freshers

### Fresher
- `GET /api/fresher/my-tasks` - Get assigned tasks
- `POST /api/fresher/start-topic` - Start topic timer
- `POST /api/fresher/complete-topic` - Complete topic
- `POST /api/fresher/calculate-score` - Calculate performance score
- `POST /api/fresher/submit-simulation` - Submit simulation

### Mock Tests
- `POST /api/mock-test/create` - Create mock test (20 questions)
- `GET /api/mock-test/{testId}/start` - Start mock test (10 random)
- `POST /api/mock-test/submit` - Submit test answers

### Tasks
- `POST /api/tasks/{taskId}/complete` - Mark task as completed

### AI
- `POST /api/ai/ask` - Ask AI a question

## Environment Variables

```env
PORT=5000
DB_HOST=your-database-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GEMINI_API_KEY=your-gemini-api-key
EMAIL_USER=your-email
EMAIL_PASS=your-email-password
```

## Deployment

### Deploy to Cloud (AWS/GCP/Azure)

1. **Build Docker image**:
```bash
docker build -t sk-nextgen360 .
```

2. **Push to container registry**:
```bash
docker tag sk-nextgen360 your-registry/sk-nextgen360:latest
docker push your-registry/sk-nextgen360:latest
```

3. **Deploy to your cloud platform**:
   - AWS ECS/Fargate
   - Google Cloud Run
   - Azure Container Instances
   - Digital Ocean App Platform

### Deploy to Heroku

```bash
heroku container:push web -a your-app-name
heroku container:release web -a your-app-name
```

## Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black app/
```

### Type Checking
```bash
mypy app/
```

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:5000/docs`
- ReDoc: `http://localhost:5000/redoc`

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- SQL injection prevention
- CORS configuration
- Environment variable protection

## Performance

- Connection pooling for database
- Async request handling
- Efficient query optimization
- Static file caching

## Support

For issues or questions, please contact the development team or create an issue in the repository.

## License

Proprietary - SK NextGen 360
