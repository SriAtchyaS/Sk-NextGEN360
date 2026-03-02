#!/usr/bin/env python3
"""
SK NextGen 360 - Application Launcher
Quick start script for development and production
"""

import os
import sys

def main():
    """Run the FastAPI application"""
    print("Starting SK NextGen 360 Application...")
    print("=" * 50)

    # Check if .env file exists
    if not os.path.exists(".env"):
        print("Warning: .env file not found!")
        print("Please create a .env file with required configuration.")
        sys.exit(1)

    # Import uvicorn after checking requirements
    try:
        import uvicorn
        from app.main import app
    except ImportError as e:
        print(f"Error: {e}")
        print("\nPlease install requirements:")
        print("   pip install -r requirements.txt")
        sys.exit(1)

    # Get port from environment or use default
    port = int(os.getenv("PORT", 5000))

    print(f"Application starting on port {port}")
    print(f"API Documentation: http://localhost:{port}/docs")
    print(f"Application: http://localhost:{port}")
    print("=" * 50)

    # Run the application
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()
