from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from datetime import date

from app.api.v1 import deps
from app.db.models.models import User
from app.schemas.food import FoodItem, FoodItemCreate
from app.schemas.meal import (UserMealLogCreate, NaturalLanguageQuery, 
                             MacroAnalysisResponse, UserMealLog, LoggedFoodItem)
from app.crud import crud_food, crud_meal
from app.services import nutrition_ai
import json

router = APIRouter()

# --- Food Library Endpoints ---

@router.post("/foods", response_model=FoodItem)
def create_food_item_for_user(
    *,
    db: Session = Depends(deps.get_db),
    food_in: FoodItemCreate,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Add a new food to the user's personal food library.
    """
    return crud_food.create_user_food_item(db=db, food_in=food_in, user_id=current_user.id)

@router.get("/foods/search", response_model=list[FoodItem])
def search_user_food_items(
    *,
    db: Session = Depends(deps.get_db),
    query: str,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Search the user's food library.
    """
    return crud_food.search_user_food_items(db=db, user_id=current_user.id, query=query)


# --- Meal Log Endpoints ---

@router.post("/meals/log")
def log_meal_for_user(
    *,
    db: Session = Depends(deps.get_db),
    log_in: UserMealLogCreate,
    log_date: date = Body(default_factory=date.today), # Log to today by default
    current_user: User = Depends(deps.get_current_user)
):
    """
    Log one or more food items for a given date.
    Appends to the log if one already exists for that date.
    """
    db_log = crud_meal.log_meal(
        db=db, 
        user_id=current_user.id, 
        log_date=log_date, 
        items_to_log=log_in.items_to_log
    )
    
    # We need to manually parse the JSON for the response
    return {
        "id": db_log.id,
        "date": db_log.date,
        "user_id": db_log.user_id,
        "food_items": json.loads(db_log.food_items_json),
        "total_macros": json.loads(db_log.total_macros_json)
    }

@router.get("/meals/by-date", response_model=UserMealLog)
def get_meal_log(
    *,
    db: Session = Depends(deps.get_db),
    log_date: date,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Get the full meal log (all items and totals) for a specific date.
    """
    db_log = crud_meal.get_meal_log_by_date(db=db, user_id=current_user.id, log_date=log_date)
    if not db_log:
        # Return a clean, empty log for that date
        return {
            "id": -1, "date": log_date, "user_id": current_user.id,
            "food_items": {"items": []},
            "total_macros": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}
        }
    
    # Manually parse JSON for the response model
    return {
        "id": db_log.id,
        "date": db_log.date,
        "user_id": db_log.user_id,
        "food_items": json.loads(db_log.food_items_json),
        "total_macros": json.loads(db_log.total_macros_json)
    }

# --- AI Endpoint ---

@router.post("/nutrition/analyze", response_model=MacroAnalysisResponse)
def analyze_meal_from_text(
    *,
    query: NaturalLanguageQuery,
    current_user: User = Depends(deps.get_current_user) # Keep user for rate limiting later
):
    """
    Uses AI to parse a natural language meal query into structured macro data.
    """
    analysis = nutrition_ai.analyze_meal_text(query.query)
    if not analysis:
        raise HTTPException(status_code=500, detail="Error analyzing meal text")
    return analysis