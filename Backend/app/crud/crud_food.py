from sqlalchemy.orm import Session
from app.db.models.models import FoodItem
from app.schemas.food import FoodItemCreate

def create_user_food_item(db: Session, food_in: FoodItemCreate, user_id: int):
    """
    Create a new food item for a user's personal library.
    """
    db_food = FoodItem(**food_in.dict(), user_id=user_id)
    db.add(db_food)
    db.commit()
    db.refresh(db_food)
    return db_food

def search_user_food_items(db: Session, user_id: int, query: str):
    """
    Search a user's food library by name.
    """
    return db.query(FoodItem).filter(
        FoodItem.user_id == user_id,
        FoodItem.name.ilike(f"%{query}%")
    ).all()