from fastapi import APIRouter
from .endpoints import auth, users, profile, nutrition, workout

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/login", tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(nutrition.router, prefix="/nutrition", tags=["nutrition"])
api_router.include_router(workout.router, prefix="/workouts", tags=["workouts"])