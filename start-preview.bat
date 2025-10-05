@echo off
echo Building and previewing F1 Schedule Vue App...
echo.
echo Building production version...
npm run build
echo.
echo Starting preview server at http://localhost:4173
echo Press Ctrl+C to stop the server
echo.
npm run preview
pause
