from pydantic import BaseModel

class FoodItemBase(BaseModel):
    name: str
    calories_per_100g: float
    protein_per_100g: float
    carbs_per_100g: float
    fat_per_100g: float

class FoodItemCreate(FoodItemBase):
    pass

class FoodItem(FoodItemBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True