@echo off
title Test Automation Dashboard
cd /d "%~dp0"
echo.
echo  ========================================
echo   Test Automation Dashboard
echo   http://localhost:3000
echo  ========================================
echo.
echo  Starting...
echo.
npx ts-node dashboard/server.ts
pause
