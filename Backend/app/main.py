from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create the FastAPI app instance
app = FastAPI(title="LifeHub API")

# Configure CORS (Cross-Origin Resource Sharing)
# This allows our React frontend (running on a different port)
# to communicate with our backend.
origins = [
    "http://localhost",
    "http://localhost:5173", # Default Vite dev server port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# A simple root endpoint to check if the API is running
@app.get("/")
def read_root():
    """ A simple health check endpoint. """
    return {"status": "ok", "message": "Welcome to LifeHub API!"}

# Our first real API endpoint for the frontend to call
@app.get("/api/v1/hello")
def read_hello():
    """ Returns a greeting message from the backend. """
    return {"message": "Hello from the LifeHub Backend! 👋"}