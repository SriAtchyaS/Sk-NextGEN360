from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List, Optional
import openpyxl
from io import BytesIO
from app.database import get_db_cursor
from app.auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/api/manager", tags=["Task Assignment"])

@router.post("/assign-task")
async def assign_task(
    topic: str = Form(...),
    fresher_id: int = Form(...),
    excel_file: UploadFile = File(...),
    current_user: dict = Depends(require_roles(["manager"]))
):
    """Manager assigns a task with topic and subtopics from Excel file"""
    try:
        # Read Excel file
        contents = await excel_file.read()
        workbook = openpyxl.load_workbook(BytesIO(contents))
        sheet = workbook.active

        # Extract subtopics from Excel (assuming first column contains subtopics)
        subtopics = []
        for row in sheet.iter_rows(min_row=2, values_only=True):  # Skip header
            if row[0]:  # If cell is not empty
                subtopics.append(str(row[0]).strip())

        if not subtopics:
            raise HTTPException(status_code=400, detail="No subtopics found in Excel file")

        # Store task in database
        with get_db_cursor() as cursor:
            # Create main task
            cursor.execute(
                """INSERT INTO task_assignments (topic, assigned_to, assigned_by, status, created_at)
                   VALUES (%s, %s, %s, 'pending', NOW())
                   RETURNING id""",
                (topic, fresher_id, current_user['id'])
            )
            task = cursor.fetchone()
            task_id = task['id']

            # Store subtopics
            for idx, subtopic in enumerate(subtopics, 1):
                cursor.execute(
                    """INSERT INTO task_assignment_subtopics (task_assignment_id, subtopic, sequence_order)
                       VALUES (%s, %s, %s)""",
                    (task_id, subtopic, idx)
                )

        return {
            "message": "Task assigned successfully",
            "task_id": task_id,
            "topic": topic,
            "subtopics": subtopics,
            "assigned_to": fresher_id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my-freshers")
async def get_my_freshers(current_user: dict = Depends(require_roles(["manager"]))):
    """Get freshers assigned to the logged-in manager"""
    try:
        with get_db_cursor(commit=False) as cursor:
            cursor.execute(
                """SELECT id, name, email, department
                   FROM users
                   WHERE role = 'fresher' AND manager_id = %s
                   ORDER BY name""",
                (current_user['id'],)
            )
            freshers = cursor.fetchall()

        return freshers

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/assigned-tasks")
async def get_assigned_tasks(current_user: dict = Depends(require_roles(["manager"]))):
    """Get all tasks assigned by the manager"""
    try:
        with get_db_cursor(commit=False) as cursor:
            cursor.execute(
                """SELECT t.id, t.topic, t.status, t.created_at, t.completed_at,
                          u.name as fresher_name, u.email as fresher_email
                   FROM task_assignments t
                   JOIN users u ON t.assigned_to = u.id
                   WHERE t.assigned_by = %s
                   ORDER BY t.created_at DESC""",
                (current_user['id'],)
            )
            tasks = cursor.fetchall()

        return tasks

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/task/{task_id}/subtopics")
async def get_task_subtopics(
    task_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Get subtopics for a specific task"""
    try:
        with get_db_cursor(commit=False) as cursor:
            cursor.execute(
                """SELECT subtopic, sequence_order
                   FROM task_assignment_subtopics
                   WHERE task_assignment_id = %s
                   ORDER BY sequence_order""",
                (task_id,)
            )
            subtopics = cursor.fetchall()

        return subtopics

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
