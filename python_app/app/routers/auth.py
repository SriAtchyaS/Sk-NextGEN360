from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
import psycopg2.extras
from app.database import get_db_cursor
from app.auth.jwt_handler import verify_password, get_password_hash, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    department: Optional[str] = None
    manager_id: Optional[int] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    token: str
    role: str
    name: str

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest):
    """Register a new user (Admin only in production)"""
    try:
        hashed_password = get_password_hash(data.password)

        with get_db_cursor() as cursor:
            cursor.execute(
                """INSERT INTO users (name, email, password, role, department, manager_id)
                   VALUES (%s, %s, %s, %s, %s, %s)
                   RETURNING id, name, email, role""",
                (data.name, data.email, hashed_password, data.role, data.department, data.manager_id)
            )
            user = cursor.fetchone()

        return user

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login", response_model=LoginResponse)
async def login(data: LoginRequest):
    """User login"""
    try:
        with get_db_cursor(commit=False) as cursor:
            cursor.execute("SELECT * FROM users WHERE email = %s", (data.email,))
            user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=400, detail="User not found")

        if not verify_password(data.password, user['password']):
            raise HTTPException(status_code=400, detail="Invalid password")

        # Create JWT token
        token = create_access_token(data={"id": user['id'], "role": user['role']})

        return {
            "token": token,
            "role": user['role'],
            "name": user['name']
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
