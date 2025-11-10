from pydantic import BaseModel, Field
from datetime import date
import uuid

# This schema will represent a single food item *within* a log
# We store the macros directly, not just a reference, to
# capture the data at that point in time.
class LoggedFoodItem(BaseModel):
    log_item_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    quantity_g: float
    calories: float
    protein: float
    carbs: float
    fat: float

# This is what we'll store in the `food_items_json` column
class MealLogContents(BaseModel):
    items: list[LoggedFoodItem] = []

class UserMealLogBase(BaseModel):
    date: date

class UserMealLogCreate(BaseModel):
    # The client will send a list of food items
    items_to_log: list[LoggedFoodItem]

class UserMealLog(UserMealLogBase):
    id: int
    user_id: int
    # We will parse the JSON string back into a Pydantic model
    food_items: MealLogContents
    total_macros: dict # We'll store totals like {"calories": 2000, ...}

    class Config:
        from_attributes = True
        
# Schema for the AI analysis endpoint
class NaturalLanguageQuery(BaseModel):
    query: str

class MacroAnalysisResponse(BaseModel):
    items: list[LoggedFoodItem]
    totals: dict

# Schema for Meal Plans
# class MealPlanBase(BaseModel):
#     name: str
#     items: list[LoggedFoodItem] # We re-use the schema from our meal logs

# class MealPlanCreate(MealPlanBase):
#     pass

# class MealPlan(MealPlanBase):
#     id: int
#     user_id: int

#     class Config:
#         from_attributes = True