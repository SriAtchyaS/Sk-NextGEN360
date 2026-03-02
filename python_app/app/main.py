from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
import os
from dotenv import load_dotenv
from app.database import test_connection
from app.routers import auth, admin, manager, fresher, tasks, ai, mock_test, task_assignment
import uvicorn

load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="SK NextGen 360 API",
    description="Unified Python Backend for SK NextGen 360",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(manager.router)
app.include_router(fresher.router)
app.include_router(tasks.router)
app.include_router(ai.router)
app.include_router(mock_test.router)
app.include_router(task_assignment.router)

# Mount static files (for React frontend)
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Mount uploads directory
uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
if os.path.exists(uploads_dir):
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

@app.get("/")
async def root():
    """Health check and database connection test"""
    db_status = test_connection()
    return {
        "message": "SK NextGen 360 - Python Backend",
        "status": "running",
        "database": db_status
    }

@app.get("/test")
async def test():
    """Simple test endpoint"""
    return {"message": "Server is working"}

@app.get("/api/health")
async def health_check():
    """API health check"""
    return {"status": "healthy", "version": "1.0.0"}

# Serve React app (catch-all route for frontend)
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    """Serve React frontend for non-API routes"""
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path) and not full_path.startswith("api/"):
        return FileResponse(index_path)
    return {"detail": "Not found"}, 404

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
