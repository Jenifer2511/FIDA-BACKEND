@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto :missingnode
if not exist .env.local (
  echo Create a private .env.local file using .env.example as a guide.
  echo Fill in DATABASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD and ADMIN_SESSION_SECRET first.
  pause
  exit /b 1
)
call npm install
if errorlevel 1 goto :failed
echo Starting Vercel's local runtime. Link the Vercel project if prompted.
call npx vercel dev --listen 3000
if errorlevel 1 goto :failed
exit /b 0
:missingnode
echo Install Node.js 22, then reopen this file.
pause
exit /b 1
:failed
echo The command above failed. Check its error message before continuing.
pause
exit /b 1
