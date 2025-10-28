from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from .config import settings
from typing import Optional

# Setup password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Ensure that the password doesn't exceed bcrypt's maximum length (72 characters)
MAX_PASSWORD_LENGTH = 72

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
     # Truncate password if it exceeds 72 characters
    if len(password) > MAX_PASSWORD_LENGTH:
        print(f"password length before truncation: {len(password)}")
        print(f"Password before truncation: {password}")        
        password = password[:MAX_PASSWORD_LENGTH]
        print(f"Password after truncation: {password}")
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt