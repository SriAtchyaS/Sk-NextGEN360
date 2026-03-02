from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List, Optional
import psycopg2.extras
from app.database import get_db_cursor
from app.auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/api/manager", tags=["Manager"])

class AddQuestionRequest(BaseModel):
    department: str
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str

class Answer(BaseModel):
    question_id: int
    selected: str

class SubmitTestRequest(BaseModel):
    answers: List[Answer]

@router.post("/add-question")
async def add_question(
    data: AddQuestionRequest,
    current_user: dict = Depends(require_roles(["manager"]))
):
    """Manager adds a mock test question"""
    try:
        with get_db_cursor() as cursor:
            cursor.execute(
                """INSERT INTO mock_questions
                   (department, question, option_a, option_b, option_c, option_d, correct_option, created_by)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                (
                    data.department,
                    data.question,
                    data.option_a,
                    data.option_b,
                    data.option_c,
                    data.option_d,
                    data.correct_option,
                    current_user['id']
                )
            )

        return {"message": "Question added successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/random-questions")
async def get_random_questions(
    department: str = Query(...),
    current_user: dict = Depends(require_roles(["manager"]))
):
    """Get 10 random questions for a department"""
    try:
        with get_db_cursor(commit=False) as cursor:
            cursor.execute(
                """SELECT id, question, option_a, option_b, option_c, option_d
                   FROM mock_questions
                   WHERE department = %s
                   ORDER BY RANDOM()
                   LIMIT 10""",
                (department,)
            )
            questions = cursor.fetchall()

        return questions

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submit-test")
async def submit_mock_test(
    data: SubmitTestRequest,
    current_user: dict = Depends(require_roles(["manager"]))
):
    """Submit mock test answers and get score"""
    try:
        score = 0

        with get_db_cursor(commit=False) as cursor:
            for answer in data.answers:
                cursor.execute(
                    "SELECT correct_option FROM mock_questions WHERE id = %s",
                    (answer.question_id,)
                )
                result = cursor.fetchone()

                if result and result['correct_option'] == answer.selected:
                    score += 1

        total_questions = len(data.answers)
        percentage = (score / total_questions * 100) if total_questions > 0 else 0

        return {
            "totalQuestions": total_questions,
            "score": score,
            "percentage": percentage
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my-freshers")
async def get_my_freshers(current_user: dict = Depends(require_roles(["manager"]))):
    """Get freshers assigned to the logged-in manager"""
    try:
        with get_db_cursor(commit=False) as cursor:
            cursor.execute(
                """SELECT id, name, email, department, manager_id
                   FROM users
                   WHERE role = 'fresher' AND manager_id = %s""",
                (current_user['id'],)
            )
            freshers = cursor.fetchall()

        return freshers

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
