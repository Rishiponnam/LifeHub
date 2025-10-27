from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.user import User, UserCreate
from app.crud import crud_user
from app.api.v1 import deps
from app.db.models.models import User

router = APIRouter()

@router.post("/", response_model=User)
def create_user(user: UserCreate, db: Session = Depends(deps.get_db)):
    db_user = crud_user.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud_user.create_user(db=db, user=user)

@router.get("/me", response_model=User)
def read_users_me(
    current_user: User = Depends(deps.get_current_user)
):
    """
    Get current user.
    """
    return current_user