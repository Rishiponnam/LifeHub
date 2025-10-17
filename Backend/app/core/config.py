from pydantic_settings import BaseSettings, SettingsConfigDict

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
    SECRET_KEY: str = "a_very_secret_key_that_should_be_changed"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30


# Create a single instance of the settings to be used throughout the app
settings = Settings()