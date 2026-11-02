@echo off
setlocal
cd /d "%~dp0"
where.exe node.exe >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install the LTS version from https://nodejs.org/
  pause
  exit /b 1
)
echo SPATIA local preview - no deployment
echo Open this address in your browser: http://127.0.0.1:4173/
echo Keep this window open. Press Ctrl+C to stop.
node.exe preview-server.cjs
if errorlevel 1 pause
