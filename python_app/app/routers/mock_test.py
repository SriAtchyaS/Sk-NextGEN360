from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from app.database import get_db_cursor
from app.auth.dependencies import get_current_user, require_roles
from app.services.gemini_service import generate_mock_test_questions, get_random_questions

router = APIRouter(prefix="/api/mock-test", tags=["Mock Test"])

class GenerateTestRequest(BaseModel):
    task_id: int

class Answer(BaseModel):
    question: str
    selected: str

class SubmitMockTestRequest(BaseModel):
    task_id: int
    answers: List[Answer]

@router.post("/generate-for-task")
async def generate_test_for_task(
    data: GenerateTestRequest,
    current_user: dict = Depends(require_roles(["manager"]))
):
    """Manager generates a mock test for a specific task using Gemini API"""
    try:
        with get_db_cursor() as cursor:
            # Get task details
            cursor.execute(
                """SELECT t.topic, t.assigned_to
                   FROM task_assignments t
                   WHERE t.id = %s AND t.assigned_by = %s""",
                (data.task_id, current_user['id'])
            )
            task = cursor.fetchone()

            if not task:
                raise HTTPException(status_code=404, detail="Task not found or not assigned by you")

            # Get subtopics
            cursor.execute(
                """SELECT subtopic FROM task_assignment_subtopics
                   WHERE task_assignment_id = %s ORDER BY sequence_order""",
                (data.task_id,)
            )
            subtopics_result = cursor.fetchall()
            subtopics = [s['subtopic'] for s in subtopics_result]

        # Generate questions using Gemini API
        questions = await generate_mock_test_questions(task['topic'], subtopics, 20)

        # Store questions in database
        with get_db_cursor() as cursor:
            # Create mock test record
            cursor.execute(
                """INSERT INTO mock_tests (task_assignment_id, topic, manager_id, generated_by_ai)
                   VALUES (%s, %s, %s, true)
                   RETURNING id""",
                (data.task_id, task['topic'], current_user['id'])
            )
            test = cursor.fetchone()
            test_id = test['id']

            # Store all 20 questions
            for q in questions:
                cursor.execute(
                    """INSERT INTO mock_test_questions
                       (mock_test_id, question, option_a, option_b, option_c, option_d, correct_answer)
                       VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                    (test_id, q['question'], q['option_a'], q['option_b'], q['option_c'], q['option_d'], q['correct_answer'])
                )

        return {
            "message": "Mock test generated successfully using AI",
            "test_id": test_id,
            "topic": task['topic'],
            "questions_generated": len(questions)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/start-by-task/{task_id}")
async def start_test_by_task_id(
    task_id: int,
    current_user: dict = Depends(require_roles(["fresher"]))
):
    """Fresher starts a mock test by task ID - get 10 random questions"""
    try:
        with get_db_cursor(commit=False) as cursor:
            # Verify task is assigned to this fresher
            cursor.execute(
                """SELECT id FROM task_assignments
                   WHERE id = %s AND assigned_to = %s AND status = 'completed'""",
                (task_id, current_user['id'])
            )
            task = cursor.fetchone()

            if not task:
                raise HTTPException(
                    status_code=404,
                    detail="Task not found, not assigned to you, or not yet completed"
                )

            # Get mock test for this task
            cursor.execute(
                """SELECT id FROM mock_tests WHERE task_assignment_id = %s""",
                (task_id,)
            )
            test = cursor.fetchone()

            if not test:
                raise HTTPException(status_code=404, detail="No mock test available for this task")

            # Get 10 random questions
            cursor.execute(
                """SELECT id, question, option_a, option_b, option_c, option_d
                   FROM mock_test_questions
                   WHERE mock_test_id = %s
                   ORDER BY RANDOM()
                   LIMIT 10""",
                (test['id'],)
            )
            questions = cursor.fetchall()

            if not questions:
                raise HTTPException(status_code=404, detail="No questions found for this test")

        return {
            "task_id": task_id,
            "test_id": test['id'],
            "questions": questions
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class GenerateQuickTestRequest(BaseModel):
    fresher_name: str
    topic: str

@router.post("/generate-quick-test")
async def generate_quick_test(
    data: GenerateQuickTestRequest,
    current_user: dict = Depends(require_roles(["fresher"]))
):
    """Fresher generates 10 questions by entering name and topic"""
    try:
        # Generate 10 questions using Gemini API
        questions = await generate_mock_test_questions(data.topic, [], 10)

        return {
            "message": "Questions generated successfully",
            "fresher_name": data.fresher_name,
            "topic": data.topic,
            "questions": questions
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submit")
async def submit_mock_test(
    data: SubmitMockTestRequest,
    current_user: dict = Depends(require_roles(["fresher"]))
):
    """Fresher submits mock test answers"""
    try:
        if not data.answers or len(data.answers) == 0:
            raise HTTPException(status_code=400, detail="Answers are required")

        score = 0

        with get_db_cursor() as cursor:
            # Get test ID from task ID
            cursor.execute(
                """SELECT id FROM mock_tests WHERE task_assignment_id = %s""",
                (data.task_id,)
            )
            test = cursor.fetchone()

            if not test:
                raise HTTPException(status_code=404, detail="Test not found")

            # Check answers
            for answer in data.answers:
                cursor.execute(
                    """SELECT correct_answer FROM mock_test_questions
                       WHERE mock_test_id = %s AND question = %s""",
                    (test['id'], answer.question)
                )
                correct = cursor.fetchone()

                if correct and correct['correct_answer'] == answer.selected:
                    score += 1

            final_score = (score / len(data.answers)) * 100

            # Store result
            cursor.execute(
                """INSERT INTO mock_test_results (mock_test_id, fresher_id, score, submitted_at)
                   VALUES (%s, %s, %s, NOW())""",
                (test['id'], current_user['id'], final_score)
            )

            # Update task status to indicate test is taken
            cursor.execute(
                """UPDATE task_assignments SET mock_test_completed = true
                   WHERE id = %s""",
                (data.task_id,)
            )

        return {
            "message": "Test submitted successfully",
            "score": final_score,
            "total_questions": len(data.answers),
            "correct_answers": score
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
