@echo off
REM Frontend Integration Script for SK NextGen 360 (Windows)

echo Frontend Integration Script for SK NextGen 360
echo ================================================
echo.

REM Check if Frontend exists
if not exist "..\Frontend" (
    echo Error: Frontend directory not found!
    echo Expected location: ..\Frontend
    exit /b 1
)

echo Frontend directory found
echo.

REM Navigate to Frontend
cd ..\Frontend

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

REM Build the React app
echo Building React application...
call npm run build

if errorlevel 1 (
    echo Build failed!
    exit /b 1
)

echo Frontend build successful
echo.

REM Copy build to Python app static directory
echo Copying build to Python app...
cd ..\python_app

REM Create static directory if it doesn't exist
if not exist "app\static" mkdir app\static

REM Copy build files
xcopy /E /I /Y ..\Frontend\build\* app\static\

echo Frontend integrated successfully!
echo.
echo All Done! You can now run:
echo    python run.py
echo.
echo Your React app will be served at: http://localhost:5000
echo API Documentation at: http://localhost:5000/docs

pause
