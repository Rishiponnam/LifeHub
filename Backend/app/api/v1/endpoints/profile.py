from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1 import deps
from app.db.models.models import User
from app.schemas.profile import UserProfile, UserProfileCreate, UserProfileUpdate
from app.crud import crud_profile

router = APIRouter()

@router.get("/me", response_model=UserProfile)
def read_current_user_profile(
    current_user: User = Depends(deps.get_current_user)
):
    """
    Get the profile for the currently logged-in user.
    """
    if not current_user.profile:
        raise HTTPException(status_code=404, detail="Profile not found for this user")
    return current_user.profile

@router.post("/", response_model=UserProfile)
def create_current_user_profile(
    *,
    db: Session = Depends(deps.get_db),
    profile_in: UserProfileCreate,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Create a profile for the currently logged-in user.
    A user can only have one profile.
    """
    if current_user.profile:
        raise HTTPException(status_code=400, detail="Profile already exists for this user")
    
    profile = crud_profile.create_user_profile(db=db, profile_in=profile_in, user_id=current_user.id)
    return profile

@router.put("/me", response_model=UserProfile)
def update_current_user_profile(
    *,
    db: Session = Depends(deps.get_db),
    profile_in: UserProfileUpdate,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Update the profile for the currently logged-in user.
    """
    db_profile = current_user.profile
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found, create one first")
    
    profile = crud_profile.update_user_profile(db=db, db_profile=db_profile, profile_in=profile_in)
    return profile