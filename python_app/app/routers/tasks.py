from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from app.database import get_db_cursor
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@router.post("/{taskId}/complete")
async def mark_task_completed(taskId: int, current_user: dict = Depends(get_current_user)):
    """Mark a task as completed"""
    try:
        with get_db_cursor() as cursor:
            # Mark task completed
            cursor.execute(
                "UPDATE tasks SET completed = true WHERE id = %s",
                (taskId,)
            )

            # Get fresher and manager details
            cursor.execute(
                "SELECT assigned_to FROM tasks WHERE id = %s",
                (taskId,)
            )
            task_info = cursor.fetchone()

            if not task_info:
                raise HTTPException(status_code=404, detail="Task not found")

            fresher_id = task_info['assigned_to']

            cursor.execute(
                "SELECT manager_id FROM users WHERE id = %s",
                (fresher_id,)
            )
            fresher = cursor.fetchone()

            if fresher and fresher['manager_id']:
                manager_id = fresher['manager_id']

                # Check if it's weekend
                today = datetime.now()
                day = today.weekday()  # 5=Saturday, 6=Sunday

                if day in [5, 6]:
                    # Check if all tasks are completed
                    cursor.execute(
                        """SELECT COUNT(*) as count FROM tasks
                           WHERE assigned_to = %s AND completed = false""",
                        (fresher_id,)
                    )
                    pending_tasks = cursor.fetchone()

                    if pending_tasks['count'] == 0:
                        # Check if review session already scheduled
                        cursor.execute(
                            """SELECT * FROM review_sessions
                               WHERE fresher_id = %s AND status = 'scheduled'""",
                            (fresher_id,)
                        )
                        existing_review = cursor.fetchone()

                        if not existing_review:
                            # Schedule review session
                            cursor.execute(
                                """INSERT INTO review_sessions
                                   (fresher_id, manager_id, scheduled_date, status)
                                   VALUES (%s, %s, CURRENT_DATE, 'scheduled')""",
                                (fresher_id, manager_id)
                            )

        return {"message": "Task marked as completed"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
