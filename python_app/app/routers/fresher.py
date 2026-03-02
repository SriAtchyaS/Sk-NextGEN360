from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.database import get_db_cursor
from app.auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/api/fresher", tags=["Fresher"])

class StartTopicRequest(BaseModel):
    topic_id: int

class CompleteTopicRequest(BaseModel):
    topic_id: int
    notes: Optional[str] = None

class SubmitSimulationRequest(BaseModel):
    simulation_id: int
    submission_url: str

@router.get("/my-tasks")
async def get_my_tasks(current_user: dict = Depends(require_roles(["fresher"]))):
    """Get tasks assigned to the logged-in fresher"""
    try:
        with get_db_cursor(commit=False) as cursor:
            cursor.execute(
                """SELECT t.id, t.topic, t.status, t.created_at, t.completed_at,
                          t.mock_test_completed,
                          u.name as manager_name
                   FROM task_assignments t
                   JOIN users u ON t.assigned_by = u.id
                   WHERE t.assigned_to = %s
                   ORDER BY t.created_at DESC""",
                (current_user['id'],)
            )
            tasks = cursor.fetchall()

            # Get subtopics for each task
            for task in tasks:
                cursor.execute(
                    """SELECT subtopic FROM task_assignment_subtopics
                       WHERE task_assignment_id = %s
                       ORDER BY sequence_order""",
                    (task['id'],)
                )
                subtopics_result = cursor.fetchall()
                task['subtopics'] = [s['subtopic'] for s in subtopics_result]

        return tasks

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/complete-task/{task_id}")
async def complete_task(
    task_id: int,
    current_user: dict = Depends(require_roles(["fresher"]))
):
    """Mark task as completed at end of day"""
    try:
        with get_db_cursor() as cursor:
            # Verify task belongs to this fresher
            cursor.execute(
                """SELECT id FROM task_assignments
                   WHERE id = %s AND assigned_to = %s AND status = 'pending'""",
                (task_id, current_user['id'])
            )
            task = cursor.fetchone()

            if not task:
                raise HTTPException(
                    status_code=404,
                    detail="Task not found, not assigned to you, or already completed"
                )

            # Mark task as completed
            cursor.execute(
                """UPDATE task_assignments
                   SET status = 'completed', completed_at = NOW()
                   WHERE id = %s""",
                (task_id,)
            )

        return {
            "message": "Task marked as completed. You can now take the mock test.",
            "task_id": task_id
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/start-topic")
async def start_topic(
    data: StartTopicRequest,
    current_user: dict = Depends(require_roles(["fresher"]))
):
    """Start a topic (start timer)"""
    try:
        with get_db_cursor() as cursor:
            cursor.execute(
                """INSERT INTO topic_progress (user_id, topic_id, start_time)
                   VALUES (%s, %s, NOW())""",
                (current_user['id'], data.topic_id)
            )

        return {"message": "Timer started"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/complete-topic")
async def complete_topic(
    data: CompleteTopicRequest,
    current_user: dict = Depends(require_roles(["fresher"]))
):
    """Complete a topic (end timer and save notes)"""
    try:
        with get_db_cursor() as cursor:
            cursor.execute(
                """UPDATE topic_progress
                   SET end_time = NOW(), completed = true, notes = %s
                   WHERE user_id = %s AND topic_id = %s AND completed = false""",
                (data.notes, current_user['id'], data.topic_id)
            )

        return {"message": "Topic marked as completed"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/calculate-score")
async def calculate_score(current_user: dict = Depends(require_roles(["fresher"]))):
    """Calculate score based on completed topics"""
    try:
        with get_db_cursor() as cursor:
            # Get latest completed topic
            cursor.execute(
                """SELECT start_time, end_time
                   FROM topic_progress
                   WHERE user_id = %s AND completed = true
                   ORDER BY id DESC LIMIT 1""",
                (current_user['id'],)
            )
            progress = cursor.fetchone()

            if not progress:
                raise HTTPException(status_code=400, detail="No completed topic found")

            # Calculate time spent
            time_spent_hours = (progress['end_time'] - progress['start_time']).total_seconds() / 3600

            # Calculate scores
            time_score = 20 if time_spent_hours <= 5 else 10
            completion_score = 20
            task_score = 20
            clarity_score = 20
            simulation_score = 20

            total_score = time_score + completion_score + task_score + clarity_score + simulation_score

            # Save score
            cursor.execute(
                """INSERT INTO scores
                   (user_id, task_score, speed_score, time_score, clarity_score, simulation_score, total_score)
                   VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                (current_user['id'], task_score, 20, time_score, clarity_score, simulation_score, total_score)
            )

        return {
            "message": "Score calculated successfully",
            "totalScore": total_score
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submit-simulation")
async def submit_simulation(
    data: SubmitSimulationRequest,
    current_user: dict = Depends(require_roles(["fresher"]))
):
    """Submit a simulation"""
    try:
        with get_db_cursor() as cursor:
            cursor.execute(
                """UPDATE simulations
                   SET submission_url = %s, status = 'submitted'
                   WHERE id = %s AND assigned_to = %s""",
                (data.submission_url, data.simulation_id, current_user['id'])
            )

        return {"message": "Simulation submitted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
