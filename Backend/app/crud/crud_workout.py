import json
from datetime import date
from sqlalchemy.orm import Session
from app.db.models.models import Exercise, WorkoutPlan, WorkoutLog
from app.schemas import workout as schemas # Import the schemas file
from fastapi import HTTPException, status

# --- Exercise CRUD ---
def get_exercises(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Exercise).offset(skip).limit(limit).all()

def search_exercises(db: Session, query: str):
    return db.query(Exercise).filter(Exercise.name.ilike(f"%{query}%")).all()

# --- Workout Plan CRUD ---
def create_workout_plan(db: Session, user_id: int, plan_in: schemas.WorkoutPlanCreate):
    # Serialize the exercises list into a JSON string
    plan_details_json = json.dumps([ex.dict() for ex in plan_in.exercises])
    
    db_plan = WorkoutPlan(
        name=plan_in.name,
        user_id=user_id,
        goal_type=plan_in.goal_type,
        plan_details_json=plan_details_json
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

def get_workout_plans_by_user(db: Session, user_id: int):
    return db.query(WorkoutPlan).filter(WorkoutPlan.user_id == user_id).all()

def get_workout_plan_by_id(db: Session, plan_id: int, user_id: int):
    return db.query(WorkoutPlan).filter(
        WorkoutPlan.id == plan_id, 
        WorkoutPlan.user_id == user_id
    ).first()

def delete_workout_plan(db: Session, plan_id: int, user_id: int):
    db_plan = get_workout_plan_by_id(db, plan_id=plan_id, user_id=user_id)
    if not db_plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    
    db.delete(db_plan)
    db.commit()
    return db_plan

# --- Workout Log CRUD ---
def create_workout_log(db: Session, user_id: int, log_in: schemas.WorkoutLogCreate):
    # Serialize the logged exercises list into a JSON string
    log_details_json = json.dumps([ex.dict() for ex in log_in.exercises])
    
    db_log = WorkoutLog(
        user_id=user_id,
        date=log_in.date,
        notes=log_in.notes,
        log_details_json=log_details_json
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_workout_logs_by_user(db: Session, user_id: int, start_date: date, end_date: date):
    return db.query(WorkoutLog).filter(
        WorkoutLog.user_id == user_id,
        WorkoutLog.date >= start_date,
        WorkoutLog.date <= end_date
    ).all()

def get_workout_log_by_id(db: Session, log_id: int, user_id: int):
    return db.query(WorkoutLog).filter(
        WorkoutLog.id == log_id,
        WorkoutLog.user_id == user_id
    ).first()

def delete_workout_log(db: Session, log_id: int, user_id: int):
    db_log = get_workout_log_by_id(db, log_id=log_id, user_id=user_id)
    if not db_log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Log not found")
        
    db.delete(db_log)
    db.commit()
    return db_log