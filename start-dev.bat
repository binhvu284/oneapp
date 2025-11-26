@echo off
REM OneApp Local Development Startup Script for Windows
REM This script starts both frontend and backend servers

echo.
echo 🚀 Starting OneApp Development Servers...
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node -v
echo.

REM Install root dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing root dependencies...
    call npm install
)

REM Install dependencies if node_modules doesn't exist
if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo 🎯 Starting servers with concurrently...
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:3001
echo.
echo Press Ctrl+C to stop all servers
echo.

REM Use npm script to start both servers
call npm run dev

pause

