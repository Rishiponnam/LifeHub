from fastapi import APIRouter
from .endpoints import auth, users, profile  # Import profile

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/login", tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
# Add the new profile router
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])