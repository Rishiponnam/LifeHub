import google.generativeai as genai
from app.core.config import settings
from app.schemas.meal import MacroAnalysisResponse, LoggedFoodItem
import json
from typing import Union

# Configure the Gemini client
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

# This prompt is the "magic." We're forcing it to return JSON.
SYSTEM_PROMPT = """
You are a meticulous nutrition analysis expert. Your single task is to analyze a user's meal
description and return ONLY a valid JSON object.
Do not, under any circumstances, return markdown (```json ... ```), explanatory text, or any
headers. Only return the raw JSON string.

The JSON object MUST be a list of food item objects.
Each object in the list MUST contain ALL of the following fields:
- "name": The name of the food item.
- "quantity_g": An *estimated* quantity in grams.
- "calories": Estimated calories for that quantity.
- "protein": Estimated protein in grams for that quantity.
- "carbs": Estimated carbohydrates in grams for that quantity.
- "fat": Estimated fat in grams for that quantity.

**Crucial Instructions:**
- **Pay close attention to user-provided data:** If the user gives specific quantities or
  macros (e.g., "110g of brown bread which has 14g protein per 100g"), use that
  information to be more accurate.
- **Do not skip any fields.** All fields are mandatory for every item.

**Example Input:** "I had 2 boiled eggs and a bowl of oatmeal"
**Example Output:**
[
  {
    "name": "Boiled Eggs",
    "quantity_g": 100,
    "calories": 155,
    "protein": 13,
    "carbs": 1.1,
    "fat": 11
  },
  {
    "name": "Oatmeal",
    "quantity_g": 234,
    "calories": 158,
    "protein": 5.5,
    "carbs": 27,
    "fat": 3.2
  }
]
"""

def analyze_meal_text(query: str) -> Union[MacroAnalysisResponse, None]:
    try:
        full_prompt = f"{SYSTEM_PROMPT}\n\nAnalyze this meal: \"{query}\""
        response = model.generate_content(full_prompt)
        
        json_text = response.text.strip().replace("```json", "").replace("```", "")
        
        # 1. Parse the AI's response (which is now just a list)
        items_data = json.loads(json_text)
        
        # 2. Validate the list of items using our Pydantic schema
        validated_items: list[LoggedFoodItem] = [LoggedFoodItem(**item) for item in items_data]
        
        # 3. --- THIS IS THE FIX ---
        #    Calculate totals ourselves instead of trusting the AI
        total_calories = sum(item.calories for item in validated_items)
        total_protein = sum(item.protein for item in validated_items)
        total_carbs = sum(item.carbs for item in validated_items)
        total_fat = sum(item.fat for item in validated_items)

        totals = {
            "calories": total_calories,
            "protein": total_protein,
            "carbs": total_carbs,
            "fat": total_fat
        }
        
        # 4. Return the full, validated, and correctly calculated response
        return MacroAnalysisResponse(items=validated_items, totals=totals)
        
    except Exception as e:
        print(f"Error during AI analysis: {e}")
        return None