from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    """
    Manages application settings using environment variables.
    """
    #
    # IMPORTANT: The model_config tells Pydantic to load variables from a .env file.
    #
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database URL. The format is:
    # postgresql://<user>:<password>@<host>:<port>/<dbname>
    DATABASE_URL: str

    # Secret key for signing JWTs
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS origins, this will allow requests from specified origins
    BACKEND_CORS_ORIGINS: List[str] = ["*"]  # Allow all origins by default. Adjust as needed.

    #Gemini API Key
    GEMINI_API_KEY: str


# Create a single instance of the settings to be used throughout the app
settings = Settings()