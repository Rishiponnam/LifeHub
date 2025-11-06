from fastapi import APIRouter, Depends, HTTPException, Body, Query, status
from sqlalchemy.orm import Session
from datetime import date
from pydantic import BaseModel
from app.api.v1 import deps
from app.db.models.models import User
from app.schemas import meal
from app.schemas.food import FoodItem, FoodItemCreate
from app.schemas.meal import (UserMealLogCreate, NaturalLanguageQuery, 
                             MacroAnalysisResponse, UserMealLog, LoggedFoodItem)
from app.crud import crud_food, crud_meal
from app.services import nutrition_ai
import json

router = APIRouter()

# This is a helper schema for the delete endpoint
class DeleteItemPayload(BaseModel):
    date: date
    log_item_id: str

# Helper function to parse log response (we'll reuse this)
def parse_log_response(db_log: UserMealLog):
    return {
        "id": db_log.id,
        "date": db_log.date,
        "user_id": db_log.user_id,
        "food_items": json.loads(db_log.food_items_json),
        "total_macros": json.loads(db_log.total_macros_json)
    }

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
    log_date: date = Query(default_factory=date.today), # Log to today by default
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

@router.put("/meals/log-item/{log_item_id}", response_model=UserMealLog)
def update_a_logged_item(
    *,
    db: Session = Depends(deps.get_db),
    log_item_id: str,
    log_date: date = Query(...),
    item_in: LoggedFoodItem,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Update a single food item in a user's log.
    """
    db_log = crud_meal.get_meal_log_by_date(db, user_id=current_user.id, log_date=log_date)
    if not db_log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Log not found for this date")

    updated_log = crud_meal.update_logged_item(db, db_log=db_log, log_item_id=log_item_id, item_in=item_in)
    return parse_log_response(updated_log)

@router.delete("/meals/log-item", response_model=UserMealLog)
def delete_a_logged_item(
    *,
    db: Session = Depends(deps.get_db),
    payload: DeleteItemPayload,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Delete a single food item from a user's log.
    (We use a POST-style delete to send a body)
    """
    db_log = crud_meal.get_meal_log_by_date(db, user_id=current_user.id, log_date=payload.date)
    if not db_log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Log not found for this date")

    updated_log = crud_meal.delete_logged_item(db, db_log=db_log, log_item_id=payload.log_item_id)
    return parse_log_response(updated_log)

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

# @router.post("/meal-plans", response_model=meal.MealPlan)
# def create_saved_meal_plan(
#     *,
#     db: Session = Depends(deps.get_db),
#     plan_in: meal.MealPlanCreate,
#     current_user: User = Depends(deps.get_current_user)
# ):
#     """
#     Save a list of food items as a reusable meal plan.
#     (e.g., from an AI analysis)
#     """
#     db_plan = crud_meal.create_meal_plan(db=db, user_id=current_user.id, plan_in=plan_in)
    
#     # We must manually parse the JSON string back into a list for the response
#     return {
#         "id": db_plan.id,
#         "name": db_plan.name,
#         "user_id": db_plan.user_id,
#         "items": json.loads(db_plan.items_json).get("items", [])
#     }

# @router.get("/meal-plans", response_model=list[meal.MealPlan])
# def get_saved_meal_plans(
#     *,
#     db: Session = Depends(deps.get_db),
#     current_user: User = Depends(deps.get_current_user)
# ):
#     """
#     Get all saved meal plans for the current user.
#     """
#     plans = crud_meal.get_meal_plans_by_user(db=db, user_id=current_user.id)
    
#     # Manually parse the JSON string for each plan in the list
#     response_list = []
#     for plan in plans:
#         response_list.append({
#             "id": plan.id,
#             "name": plan.name,
#             "user_id": plan.user_id,
#             "items": json.loads(plan.items_json).get("items", [])
#         })
#     return response_list

# @router.post("/meal-plans/{plan_id}/log")
# def log_saved_meal_plan(
#     *,
#     db: Session = Depends(deps.get_db),
#     plan_id: int,
#     log_date: date = Query(default_factory=date.today),
#     current_user: User = Depends(deps.get_current_user)
# ):
#     """
#     Finds a saved meal plan by its ID and logs all its items
#     to the user's meal log for the given date.
#     """
#     db_plan = crud_meal.get_meal_plan_by_id(db=db, plan_id=plan_id)
    
#     if not db_plan:
#         raise HTTPException(status_code=404, detail="Meal plan not found")
#     if db_plan.user_id != current_user.id:
#         raise HTTPException(status_code=403, detail="Not authorized to log this plan")
    
#     # Get the items from the saved plan's JSON
#     items_to_log = meal.MealLogContents.parse_raw(db_plan.items_json).items
    
#     if not items_to_log:
#         raise HTTPException(status_code=400, detail="Meal plan is empty")
        
#     # Use our existing log_meal function to add them to the day's log
#     db_log = crud_meal.log_meal(
#         db=db,
#         user_id=current_user.id,
#         log_date=log_date,
#         items_to_log=items_to_log
#     )
    
#     # Return the same response as the other log endpoint
#     return {
#         "id": db_log.id,
#         "date": db_log.date,
#         "user_id": db_log.user_id,
#         "food_items": json.loads(db_log.food_items_json),
#         "total_macros": json.loads(db_log.total_macros_json)
#     }