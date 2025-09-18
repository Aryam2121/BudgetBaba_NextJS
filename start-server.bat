@echo off
echo Installing server dependencies...
cd server
npm install
echo.
echo Starting the server...
npm run dev
pause
