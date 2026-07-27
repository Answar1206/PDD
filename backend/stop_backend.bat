@echo off
cd /d "%~dp0"

echo ======================================================
echo 🛑 STOPPING FORENSIQ AI BACKEND
echo ======================================================
echo.
echo Searching for active Python processes and stopping them...

taskkill /F /IM python.exe /T

echo.
echo ======================================================
echo ✅ All FORENSIQ AI backend processes stopped!
echo ======================================================
pause
