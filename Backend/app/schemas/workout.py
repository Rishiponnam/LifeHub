import uuid
from pydantic import BaseModel, Field
from datetime import date
from app.db.models.models import ExerciseMuscleGroup, ExerciseDifficulty, WorkoutGoalType
from typing import Optional

# --- Exercise Schemas ---
class ExerciseBase(BaseModel):
    name: str
    muscle_group: ExerciseMuscleGroup
    equipment: Optional[str] = None
    difficulty: ExerciseDifficulty
    instructions: Optional[str] = None

class ExerciseCreate(ExerciseBase):
    pass

class Exercise(ExerciseBase):
    id: int
    class Config:
        from_attributes = True

# --- Workout Plan Schemas ---
# This is the Pydantic model for an exercise *within* a plan
class PlanExercise(BaseModel):
    # We will store the exercise_id and name for frontend convenience
    exercise_id: int
    name: str 
    sets: int
    reps: str # e.g., "8-10" or "15"

class WorkoutPlanBase(BaseModel):
    name: str
    goal_type: WorkoutGoalType

class WorkoutPlanCreate(WorkoutPlanBase):
    # The frontend will send a list of these objects
    exercises: list[PlanExercise]

class WorkoutPlan(WorkoutPlanBase):
    id: int
    user_id: int
    # The response will also include the parsed list of exercises
    exercises: list[PlanExercise] 
    
    class Config:
        from_attributes = True

# --- Workout Log Schemas ---
# This is a single set (e.g., 10 reps at 50kg)
class LoggedSet(BaseModel):
    reps: int
    weight: float # Use float for weight (e.g., 22.5)

# This is a full exercise logged (e.g., 3 sets of Bench Press)
class LoggedExercise(BaseModel):
    log_exercise_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    exercise_id: int
    exercise_name: str
    sets: list[LoggedSet]

class WorkoutLogBase(BaseModel):
    date: date
    notes: Optional[str] = None

class WorkoutLogCreate(WorkoutLogBase):
    exercises: list[LoggedExercise]

class WorkoutLog(WorkoutLogBase):
    id: int
    user_id: int
    exercises: list[LoggedExercise]

    class Config:
        from_attributes = True