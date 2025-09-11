#!/bin/bash

echo "🔄 Restarting songIQ servers..."

# Kill all Node.js processes
echo "⏹️  Stopping all Node.js processes..."
pkill -f node 2>/dev/null || true

# Wait a moment for processes to fully stop
sleep 2

# Kill any processes still using our ports
echo "🧹 Clearing ports 3001 and 5001..."
kill -9 $(lsof -ti:3001) 2>/dev/null || true
kill -9 $(lsof -ti:5001) 2>/dev/null || true

# Wait a moment for ports to be released
sleep 2

echo "🚀 Starting server..."
cd /Users/allanrestrepo/Documents/GitHub/songIQ/songiq/server
npm run dev &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

echo "🌐 Starting client..."
cd /Users/allanrestrepo/Documents/GitHub/songIQ/songiq/client
npm run dev &
CLIENT_PID=$!

echo "✅ Both servers started!"
echo "📱 Client: http://localhost:3001"
echo "🔧 Server: http://localhost:5001"
echo ""
echo "To stop servers: Press Ctrl+C or run 'pkill -f node'"
echo "Server PID: $SERVER_PID"
echo "Client PID: $CLIENT_PID"

# Wait for user to stop
wait
