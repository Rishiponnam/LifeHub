from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# The engine is the entry point to the database.
# It's configured with the database URL from our settings.
# pool_pre_ping=True checks connections for liveness before use.
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

# SessionLocal is a "factory" for creating new database sessions.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)