#!/bin/bash

echo "🔄 Restarting Backend Server..."
echo ""

# Navigate to backend directory
cd /home/nathanadmin/Projects/MOPAS/travooz_hms/backend

# Kill any existing node processes on port 3001
echo "📍 Checking for existing processes on port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "No existing process found"

# Wait a moment
sleep 2

# Start the backend
echo ""
echo "🚀 Starting backend server..."
echo "📝 Rate limiting is now configured for development mode"
echo "✅ Profile endpoints will not be rate limited"
echo ""
echo "Press Ctrl+C to stop the server"
echo "----------------------------------------"
echo ""

npm start
