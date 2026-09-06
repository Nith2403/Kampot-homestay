@echo off
cd /d "%~dp0"
echo ========================================================
echo   Starting Kampot Road Trip Planner (React + Tailwind)
echo ========================================================
echo.

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js and NPM were not found on your system.
    echo Please install Node.js from https://nodejs.org/
    echo OR simply double-click 'standalone.html' to open it directly in your browser!
    echo.
    pause
    exit /b
)

if not exist node_modules (
    echo [1/2] Installing dependencies (React, Vite, Tailwind)...
    echo This only happens on the first run.
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install packages.
        pause
        exit /b
    )
)

echo [2/2] Starting local Vite development server...
echo.
call npm run dev
pause

