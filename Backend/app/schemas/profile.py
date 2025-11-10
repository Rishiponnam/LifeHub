from pydantic import BaseModel
from app.db.models.models import UserGoal, ActivityLevel
from typing import Optional

class UserProfileBase(BaseModel):
    age: Optional[int] = None
    height: Optional[float] = None  # in cm
    weight: Optional[float] = None  # in kg
    goal: Optional[UserGoal] = UserGoal.maintain_weight  # Use Optional for Enums
    activity_level: Optional[ActivityLevel] = ActivityLevel.sedentary

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(UserProfileBase):
    pass

class UserProfile(UserProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True