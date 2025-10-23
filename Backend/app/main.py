from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router # Import the router
from app.core.config import settings

# We will create api_router in the next steps
# from app.api.v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title="LifeHub API",
    openapi_url=f"/api/v1/openapi.json"
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix="/api/v1") # Include the API router

@app.get("/")
def read_root():
    return {"message": "Welcome to LifeHub API!"}