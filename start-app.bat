@echo off
echo ====================================
echo  Smart Expense Tracker - Full Setup
echo ====================================
echo.

echo [1/4] Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo [2/4] Installing backend dependencies...
cd server
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

echo [3/4] Starting backend server...
start "Backend Server" cmd /c "cd server && npm run dev"

echo [4/4] Waiting 5 seconds before starting frontend...
timeout /t 5 /nobreak > nul

echo Starting frontend server...
echo.
echo ====================================
echo  Setup Complete!
echo ====================================
echo  Frontend: http://localhost:3000
echo  Backend:  http://localhost:5000/api
echo ====================================
echo.

start "Frontend Server" cmd /c "npm run dev"

echo Both servers are starting...
echo Check the opened windows for server status.
pause
