import json
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import date

from app.api.v1 import deps
from app.db.models.models import User
from app.crud import crud_workout
from app.schemas import workout as schemas

router = APIRouter()

# --- Helper Function ---
def parse_plan_response(db_plan):
    """Parses JSON string from DB into a list for the response."""
    return {
        "id": db_plan.id,
        "name": db_plan.name,
        "user_id": db_plan.user_id,
        "goal_type": db_plan.goal_type,
        "exercises": json.loads(db_plan.plan_details_json)
    }

def parse_log_response(db_log):
    """Parses JSON string from DB into a list for the response."""
    return {
        "id": db_log.id,
        "date": db_log.date,
        "user_id": db_log.user_id,
        "notes": db_log.notes,
        "exercises": json.loads(db_log.log_details_json)
    }

# --- Exercise Endpoints ---
@router.get("/exercises", response_model=list[schemas.Exercise])
def read_master_exercise_list(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Get the master list of all available exercises.
    """
    return crud_workout.get_exercises(db, skip=skip, limit=limit)

@router.get("/exercises/search", response_model=list[schemas.Exercise])
def search_master_exercise_list(
    *,
    db: Session = Depends(deps.get_db),
    query: str = Query(..., min_length=1)
):
    """
    Search the master exercise list by name.
    """
    return crud_workout.search_exercises(db, query=query)

# --- Workout Plan Endpoints ---
@router.post("/plans", response_model=schemas.WorkoutPlan)
def create_a_workout_plan(
    *,
    db: Session = Depends(deps.get_db),
    plan_in: schemas.WorkoutPlanCreate,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Create a new reusable workout plan.
    """
    db_plan = crud_workout.create_workout_plan(db, user_id=current_user.id, plan_in=plan_in)
    return parse_plan_response(db_plan)

@router.get("/plans", response_model=list[schemas.WorkoutPlan])
def get_my_workout_plans(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Get all saved workout plans for the current user.
    """
    plans = crud_workout.get_workout_plans_by_user(db, user_id=current_user.id)
    return [parse_plan_response(plan) for plan in plans]

# --- Workout Log Endpoints ---
@router.post("/logs", response_model=schemas.WorkoutLog)
def log_a_workout(
    *,
    db: Session = Depends(deps.get_db),
    log_in: schemas.WorkoutLogCreate,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Log a completed workout for a specific date.
    """
    db_log = crud_workout.create_workout_log(db, user_id=current_user.id, log_in=log_in)
    return parse_log_response(db_log)

@router.get("/logs", response_model=list[schemas.WorkoutLog])
def get_my_workout_logs(
    *,
    db: Session = Depends(deps.get_db),
    start_date: date,
    end_date: date,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Get workout logs for the current user within a date range.
    """
    logs = crud_workout.get_workout_logs_by_user(db, user_id=current_user.id, start_date=start_date, end_date=end_date)
    return [parse_log_response(log) for log in logs]

# --- NEW: Get a single plan (to load it for logging) ---
@router.get("/plans/{plan_id}", response_model=schemas.WorkoutPlan)
def get_a_workout_plan(
    *,
    db: Session = Depends(deps.get_db),
    plan_id: int,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Get a single workout plan by its ID.
    """
    db_plan = crud_workout.get_workout_plan_by_id(db, plan_id=plan_id, user_id=current_user.id)
    if not db_plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    return parse_plan_response(db_plan)

# --- NEW: Delete a plan ---
@router.delete("/plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_a_workout_plan(
    *,
    db: Session = Depends(deps.get_db),
    plan_id: int,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Delete a workout plan.
    """
    crud_workout.delete_workout_plan(db, plan_id=plan_id, user_id=current_user.id)
    return {"ok": True} # Return nothing as per 204

# --- NEW: Delete a log ---
@router.delete("/logs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_a_workout_log(
    *,
    db: Session = Depends(deps.get_db),
    log_id: int,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Delete a single workout log entry.
    """
    crud_workout.delete_workout_log(db, log_id=log_id, user_id=current_user.id)
    return {"ok": True}