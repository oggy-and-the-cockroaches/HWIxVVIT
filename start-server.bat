@echo off
title HWI x VVITU Platform - Local Development Server
echo ========================================================
echo   HackWithIndia x VVITU Community Platform
echo   Starting Local Development Server...
echo ========================================================
echo.
echo Running on http://localhost:8000
echo.
echo Opening Admin Login in your browser...
start http://localhost:8000/admin/login.html
echo.
echo Press Ctrl+C in this terminal window to stop the server.
echo.

:: Try Python 3 first, fallback to Node npx
python -m http.server 8000 2>nul || py -3 -m http.server 8000 2>nul || npx serve -l 8000 . 2>nul || (
  echo Could not start Python or Node HTTP server.
  echo Please open with VS Code Live Server or install Python / Node.
  pause
)
