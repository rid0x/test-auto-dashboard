@echo off
title Test Automation Dashboard
cd /d "%~dp0"
echo.
echo  ========================================
echo   Test Automation Dashboard
echo   http://localhost:3000
echo  ========================================
echo.

:start
echo  Starting...
npx ts-node dashboard/server.ts
echo.
echo  Dashboard stopped. Restarting in 3 seconds...
timeout /t 3 /nobreak >nul
goto start
