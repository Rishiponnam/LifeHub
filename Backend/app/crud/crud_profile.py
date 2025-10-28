from sqlalchemy.orm import Session
from app.db.models.models import UserProfile
from app.schemas.profile import UserProfileCreate, UserProfileUpdate

def get_profile(db: Session, user_id: int):
    return db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

def create_user_profile(db: Session, profile_in: UserProfileCreate, user_id: int):
    db_profile = UserProfile(**profile_in.dict(), user_id=user_id)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

def update_user_profile(db: Session, db_profile: UserProfile, profile_in: UserProfileUpdate):
    profile_data = profile_in.dict(exclude_unset=True)
    for key, value in profile_data.items():
        setattr(db_profile, key, value)
    
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile