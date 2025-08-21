#!/bin/bash

# KotaPay Backend - Quick Start Script
echo "🚀 Starting KotaPay Backend for Frontend Integration..."

# Navigate to backend directory
cd "paystack-backend"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building TypeScript project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Start the server
    echo "🌟 Starting KotaPay Backend on http://localhost:3000"
    echo "📡 API available at: http://localhost:3000/api"
    echo "🏥 Health check: http://localhost:3000/health"
    echo ""
    echo "💡 Ready for frontend integration!"
    echo "📋 Check FRONTEND_INTEGRATION_GUIDE.md for connection details"
    echo ""
    echo "🔄 Starting server... (Press Ctrl+C to stop)"
    
    npm start
else
    echo "❌ Build failed! Please check for errors above."
    exit 1
fi
