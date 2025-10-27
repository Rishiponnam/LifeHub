# backend/app/db/models.py
from sqlalchemy import (Column, Integer, String, Boolean, Date, ForeignKey, 
                        Enum, Float)
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base

# --- Enums for Profile ---
class UserGoal(str, enum.Enum):
    lose_weight = "lose_weight"
    maintain_weight = "maintain_weight"
    gain_muscle = "gain_muscle"

class ActivityLevel(str, enum.Enum):
    sedentary = "sedentary"
    lightly_active = "lightly_active"
    moderately_active = "moderately_active"
    very_active = "very_active"
    extra_active = "extra_active"

# --- Main User Model (for Auth) ---
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean(), default=True)

    # One-to-one relationship to UserProfile
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    
    # Relationships to other data
    workout_plans = relationship("WorkoutPlan", back_populates="owner")
    workout_logs = relationship("WorkoutLog", back_populates="owner")
    meal_logs = relationship("UserMealLog", back_populates="owner")

# --- User Profile Model (for Stats) ---
class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    age = Column(Integer, nullable=True)
    # Store height in cm, weight in kg
    height = Column(Float, nullable=True) 
    weight = Column(Float, nullable=True)
    
    goal = Column(Enum(UserGoal), nullable=True, default=UserGoal.maintain_weight)
    activity_level = Column(Enum(ActivityLevel), nullable=True, default=ActivityLevel.sedentary)

    # One-to-one relationship back to User
    user = relationship("User", back_populates="profile")


# --- Placeholder Models for Later Phases ---
# We'll fill these in as we go, but let's define them so Alembic sees them.

class Exercise(Base):
    __tablename__ = "exercises"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    muscle_group = Column(String, index=True)
    equipment = Column(String, nullable=True)
    
class WorkoutPlan(Base):
    __tablename__ = "workout_plans"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    # We'll use JSON to store the list of exercises
    exercises_json = Column(String) # Or use SQLAlchemy's JSON type if Postgres
    
    owner = relationship("User", back_populates="workout_plans")

class WorkoutLog(Base):
    __tablename__ = "workout_logs"
    id = Column(Integer, primary_key=True)
    date = Column(Date, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    exercises_json = Column(String) # What was actually done
    notes = Column(String, nullable=True)
    
    owner = relationship("User", back_populates="workout_logs")

class FoodItem(Base):
    __tablename__ = "food_items"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, index=True)
    # Per 100g
    calories = Column(Float, nullable=False)
    protein = Column(Float, nullable=False)
    carbs = Column(Float, nullable=False)
    fat = Column(Float, nullable=False)
    # We can add user_id to make this a user-specific food db
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

class UserMealLog(Base):
    __tablename__ = "user_meal_logs"
    id = Column(Integer, primary_key=True)
    date = Column(Date, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    food_items_json = Column(String) # List of food IDs and quantities
    total_macros_json = Column(String)
    
    owner = relationship("User", back_populates="meal_logs")