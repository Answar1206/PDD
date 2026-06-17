@echo off
:: Move to the directory where the batch file is located
cd /d "%~dp0"

echo ======================================================
echo 🚀 STARTING FORENSIQ AI BACKEND (PERSISTENT BACKGROUND)
echo ======================================================
echo.
echo Checking if backend is already running on port 5000...
powershell -Command "$conn = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue; if ($conn) { write-host 'Backend is already running!' -ForegroundColor Green; exit 0 } else { exit 1 }"

if %ERRORLEVEL% EQU 0 (
    echo Backend is already active. No action needed.
    goto end
)

echo Starting backend in completely detached hidden window...
:: Starts python.exe from the virtual environment running launcher.py silently
powershell -Command "Start-Process -FilePath '.venv\Scripts\python.exe' -ArgumentList 'launcher.py' -WindowStyle Hidden -WorkingDirectory '%cd%'"

echo Waiting for server to initialize...
timeout /t 5 /nobreak >nul

echo Checking connection...
powershell -Command "$conn = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue; if ($conn) { write-host '🚀 Backend successfully started and listening on port 5000!' -ForegroundColor Green } else { write-host '⌛ Backend is still loading machine learning models in the background. It will be fully ready in a few seconds.' -ForegroundColor Yellow }"

:end
echo.
echo ======================================================
echo 💡 INFO: This window can be safely closed now.
echo The backend will continue running in the background.
echo ======================================================
echo.
pause
