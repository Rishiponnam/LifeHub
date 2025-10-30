from sqlalchemy.orm import Session
from app.db.models.models import UserMealLog
from app.schemas.meal import LoggedFoodItem, MealLogContents
from datetime import date
import json

def get_meal_log_by_date(db: Session, user_id: int, log_date: date):
    return db.query(UserMealLog).filter(
        UserMealLog.user_id == user_id,
        UserMealLog.date == log_date
    ).first()

def log_meal(db: Session, user_id: int, log_date: date, items_to_log: list[LoggedFoodItem]):
    """
    Adds food items to a user's meal log for a specific date.
    If no log exists for that date, it creates one.
    """
    # 1. Check if a log for this date already exists
    db_log = get_meal_log_by_date(db, user_id=user_id, log_date=log_date)

    if not db_log:
        # Create a new log for this date
        db_log = UserMealLog(user_id=user_id, date=log_date, food_items_json="{}", total_macros_json="{}")
        db.add(db_log)
        db.commit()
        db.refresh(db_log)

    # 2. Get current items and totals from the log
    current_contents = MealLogContents.parse_raw(db_log.food_items_json) if db_log.food_items_json and db_log.food_items_json != "{}" else MealLogContents()
    current_totals = json.loads(db_log.total_macros_json) if db_log.total_macros_json and db_log.total_macros_json != "{}" else {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}

    # 3. Add new items and update totals
    for item in items_to_log:
        current_contents.items.append(item)
        current_totals["calories"] += item.calories
        current_totals["protein"] += item.protein
        current_totals["carbs"] += item.carbs
        current_totals["fat"] += item.fat
        
    # 4. Save the updated data back to the DB as JSON strings
    db_log.food_items_json = current_contents.json()
    db_log.total_macros_json = json.dumps(current_totals)
    
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    
    return db_log

# def create_meal_plan(db: Session, user_id: int, plan_in: MealPlanCreate):
#     """
#     Saves a new reusable meal plan for a user.
#     """
#     # Convert the list of items into a JSON string for the DB
#     items_json_string = MealLogContents(items=plan_in.items).json()
    
#     db_plan = MealPlan(
#         name=plan_in.name,
#         user_id=user_id,
#         items_json=items_json_string
#     )
#     db.add(db_plan)
#     db.commit()
#     db.refresh(db_plan)
#     return db_plan

# def get_meal_plans_by_user(db: Session, user_id: int):
#     """
#     Retrieves all meal plans for a specific user.
#     """
#     return db.query(MealPlan).filter(MealPlan.user_id == user_id).all()

# def get_meal_plan_by_id(db: Session, plan_id: int):
#     """
#     Retrieves a single meal plan by its ID.
#     """
#     return db.query(MealPlan).filter(MealPlan.id == plan_id).first()