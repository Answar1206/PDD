@echo off
echo ======================================================
echo 🚀 STARTING PDD APPLICATION (FRONTEND + BACKEND)
echo ======================================================
echo.

:: 0. Clean up any stuck background python processes from the old script
echo Cleaning up old processes...
taskkill /F /IM python.exe /FI "WINDOWTITLE neq PDD Backend Server*" >nul 2>&1

:: 1. Start the backend
echo [1/2] Starting Backend Server...
cd /d "%~dp0backend"
:: We start the backend in a new visible window so you can see logs and close it easily
start "PDD Backend Server" cmd /k ".\.venv\Scripts\python.exe app.py"

:: Wait a few seconds for the backend to initialize
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

:: 2. Start the frontend
echo.
echo [2/2] Starting Frontend Server...
cd /d "%~dp0frontend"
echo The frontend will now start and open in your default browser.
echo You will have two windows open: this one (Frontend) and another one (Backend).
echo Close both windows when you are done to stop the application.
echo.
npm run dev
