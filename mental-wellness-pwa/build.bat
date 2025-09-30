@echo off
echo Building MindWell PWA for Production...
echo.
powershell -ExecutionPolicy Bypass -Command "npm run build"
echo.
echo Building Service Worker...
powershell -ExecutionPolicy Bypass -Command "npm run build:sw"
echo.
echo Build complete! Check the 'build' folder for production files.
pause
