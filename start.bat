@echo off
echo Starting Amin Route Stack with Docker Compose...
docker compose version >nul 2>&1
if %errorlevel% equ 0 (
    docker compose up --build -d
) else (
    docker-compose up --build -d
)
echo Stack launched!
echo Frontend: http://localhost
echo Backend API: http://localhost:8000/docs
pause
