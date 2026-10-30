@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto :missingnode
echo Installing the FIDA project dependencies...
call npm install
if errorlevel 1 goto :failed
echo Checking and building the website...
call npm run build
if errorlevel 1 goto :failed
echo Follow Vercel's sign-in and project prompts below.
echo Use the current directory, select Vite, and create a new project on first deploy.
call npx vercel@latest --prod
if errorlevel 1 goto :failed
echo Deployment complete. Vercel printed your website URL above.
pause
exit /b 0
:missingnode
echo Install Node.js 22, then reopen this file.
pause
exit /b 1
:failed
echo The command above failed. Check its error message before continuing.
pause
exit /b 1
