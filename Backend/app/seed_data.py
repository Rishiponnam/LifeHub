import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.models.models import Exercise, ExerciseMuscleGroup, ExerciseDifficulty
from app.core.config import settings

# This is a list of common exercises to get you started
# You can add hundreds more to this list
EXERCISE_DATA = [
    {"name": "Bench Press", "muscle_group": "chest", "equipment": "barbell", "difficulty": "intermediate"},
    {"name": "Squat", "muscle_group": "legs", "equipment": "barbell", "difficulty": "intermediate"},
    {"name": "Deadlift", "muscle_group": "back", "equipment": "barbell", "difficulty": "advanced"},
    {"name": "Crunches", "muscle_group": "core", "equipment": "body_only", "difficulty": "beginner"},
    {"name": "Push-up", "muscle_group": "chest", "equipment": "body_only", "difficulty": "beginner"},
    {"name": "Pull-up", "muscle_group": "back", "equipment": "pull_up_bar", "difficulty": "intermediate"},
    {"name": "Overhead Press", "muscle_group": "shoulders", "equipment": "barbell", "difficulty": "intermediate"},
    {"name": "Dumbbell Curl", "muscle_group": "biceps", "equipment": "dumbbell", "difficulty": "beginner"},
    {"name": "Tricep Dip", "muscle_group": "triceps", "equipment": "body_only", "difficulty": "intermediate"},
    {"name": "Lunge", "muscle_group": "legs", "equipment": "body_only", "difficulty": "beginner"},
    {"name": "Plank", "muscle_group": "core", "equipment": "body_only", "difficulty": "beginner"},
    {"name": "Lat Pulldown", "muscle_group": "back", "equipment": "cable", "difficulty": "beginner"},
    {"name": "Leg Press", "muscle_group": "legs", "equipment": "machine", "difficulty": "beginner"},
    {"name": "Dumbbell Shoulder Press", "muscle_group": "shoulders", "equipment": "dumbbell", "difficulty": "intermediate"},
    {"name": "Bicep Curl (Barbell)", "muscle_group": "biceps", "equipment": "barbell", "difficulty": "beginner"},
    {"name": "Tricep Pushdown", "muscle_group": "triceps", "equipment": "cable", "difficulty": "beginner"},
]

def seed_exercises():
    print("Connecting to database...")
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    print("Seeding exercises...")
    count = 0
    for ex_data in EXERCISE_DATA:
        # Check if exercise already exists
        exists = db.query(Exercise).filter(Exercise.name == ex_data["name"]).first()
        if not exists:
            db_exercise = Exercise(
                name=ex_data["name"],
                muscle_group=ExerciseMuscleGroup(ex_data["muscle_group"]),
                equipment=ex_data["equipment"],
                difficulty=ExerciseDifficulty(ex_data["difficulty"]),
            )
            db.add(db_exercise)
            count += 1
    
    db.commit()
    print(f"Successfully added {count} new exercises.")
    db.close()
    print("Seeding complete.")

if __name__ == "__main__":
    # This makes the script runnable from the command line
    seed_exercises()