@echo off
cd /d "%~dp0"

echo ======================================================
echo 🛑 STOPPING FORENSIQ AI BACKEND
echo ======================================================
echo.
echo Searching for active virtual environment Python processes...

powershell -Command "
$procs = Get-Process python -ErrorAction SilentlyContinue | Where-Object { $_.Path -like '*PDD\.venv*' };
if ($procs) {
    foreach ($p in $procs) {
        Stop-Process -Id $p.Id -Force;
        Write-Host 'Stopped backend process with ID:' $p.Id -ForegroundColor Green
    }
    Write-Host '✅ All FORENSIQ AI backend processes stopped!' -ForegroundColor Green
} else {
    Write-Host 'ℹ️ No active FORENSIQ AI backend processes found running.' -ForegroundColor Yellow
}
"

echo.
echo ======================================================
pause
