@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto :missingnode
call npm install
if errorlevel 1 goto :failed
call npm run dev -- --open
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
