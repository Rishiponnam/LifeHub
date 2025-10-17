@echo off

REM Start backend
cd backend
start cmd /k "uvicorn app.main:app --reload --port 8000"
cd ..

REM Start frontend
cd frontend
start cmd /k "npm run dev"