from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import psycopg2.extras
from app.database import get_db_cursor
from app.auth.dependencies import get_current_user, require_roles
from app.auth.jwt_handler import get_password_hash

router = APIRouter(prefix="/api/admin", tags=["Admin"])

class CreateUserRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    department: Optional[str] = None
    manager_id: Optional[int] = None

@router.post("/create-user", status_code=201)
async def create_user(
    data: CreateUserRequest,
    current_user: dict = Depends(require_roles(["admin"]))
):
    """Create a new manager or fresher (Admin only)"""
    try:
        hashed_password = get_password_hash(data.password)

        with get_db_cursor() as cursor:
            cursor.execute(
                """INSERT INTO users (name, email, password, role, department, manager_id)
                   VALUES (%s, %s, %s, %s, %s, %s)
                   RETURNING id, name, email, role, department""",
                (data.name, data.email, hashed_password, data.role, data.department, data.manager_id)
            )
            user = cursor.fetchone()

        return user

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users")
async def get_all_users(current_user: dict = Depends(require_roles(["admin"]))):
    """Get all users (Admin only)"""
    try:
        with get_db_cursor(commit=False) as cursor:
            cursor.execute(
                "SELECT id, name, email, role, department, manager_id FROM users"
            )
            users = cursor.fetchall()

        return users

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard")
async def get_admin_dashboard(current_user: dict = Depends(require_roles(["admin"]))):
    """Get admin dashboard statistics (Admin only)"""
    try:
        with get_db_cursor(commit=False) as cursor:
            # Users by role
            cursor.execute("SELECT role, COUNT(*) as count FROM users GROUP BY role")
            users_by_role = cursor.fetchall()

            # Department performance
            cursor.execute("""
                SELECT u.department, AVG(s.total_score) as avg_score
                FROM users u
                JOIN scores s ON u.id = s.user_id
                WHERE u.role = 'fresher'
                GROUP BY u.department
            """)
            dept_scores = cursor.fetchall()

            # Total simulations
            cursor.execute("SELECT COUNT(*) as count FROM simulations")
            simulations = cursor.fetchone()

            # AI usage
            cursor.execute("SELECT COUNT(*) as count FROM ai_logs")
            ai_usage = cursor.fetchone()

        return {
            "usersByRole": users_by_role,
            "departmentPerformance": dept_scores,
            "totalSimulations": simulations['count'] if simulations else 0,
            "totalAIInteractions": ai_usage['count'] if ai_usage else 0
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
