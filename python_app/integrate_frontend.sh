#!/bin/bash
# Frontend Integration Script for SK NextGen 360

echo "🔗 SK NextGen 360 - Frontend Integration"
echo "========================================"
echo ""

# Check if Frontend exists
if [ ! -d "../Frontend" ]; then
    echo "❌ Error: Frontend directory not found!"
    echo "Expected location: ../Frontend"
    exit 1
fi

echo "✅ Frontend directory found"
echo ""

# Navigate to Frontend
cd ../Frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Build the React app
echo "🏗️  Building React application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Frontend build successful"
echo ""

# Copy build to Python app static directory
echo "📁 Copying build to Python app..."
cd ../python_app

# Create static directory if it doesn't exist
mkdir -p app/static

# Copy build files
cp -r ../Frontend/build/* app/static/

echo "✅ Frontend integrated successfully!"
echo ""
echo "🎉 All Done! You can now run:"
echo "   python run.py"
echo ""
echo "Your React app will be served at: http://localhost:5000"
echo "API Documentation at: http://localhost:5000/docs"
