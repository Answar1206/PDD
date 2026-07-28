@echo off
echo ======================================================
echo 🚀 STARTING PDD EXPO APPLICATION (WEB + BACKEND)
echo ======================================================
echo.

:: 0. Clean up any stuck background python processes
echo Cleaning up old processes...
taskkill /F /IM python.exe /FI "WINDOWTITLE neq PDD Backend Server*" >nul 2>&1

:: 1. Start the backend
echo [1/2] Starting Backend Server...
cd /d "%~dp0backend"
:: We start the backend in a new visible window so you can see logs
start "PDD Backend Server" cmd /k ".\.venv\Scripts\python.exe app.py"

:: Wait a few seconds for the backend to initialize
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

:: 2. Start the Expo Web app
echo.
echo [2/2] Starting Expo Web Server...
cd /d "%~dp0pdd-expo"
echo The Expo Web client will now bundle and open in your browser.
echo.
npm run web
