import google.generativeai as genai
from app.core.config import settings
from app.schemas.meal import MacroAnalysisResponse, LoggedFoodItem
import json

# Configure the Gemini client
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# This prompt is the "magic." We're forcing it to return JSON.
SYSTEM_PROMPT = """
You are a world-class nutrition analysis expert. The user will provide a meal description.
Your sole task is to analyze this description and return a valid JSON object.
Do NOT under any circumstances return markdown (```json ... ```) or any other text,
headers, or explanations. Only return the raw JSON string.

The JSON object must have two keys: "items" and "totals".
- "items" should be a list of food items found in the meal.
- "totals" should be an object with the total macros.

For each item in "items", provide:
- "name": The name of the food item.
- "quantity_g": An *estimated* quantity in grams.
- "calories": Estimated calories for that quantity.
- "protein": Estimated protein in grams for that quantity.
- "carbs": Estimated carbohydrates in grams for that quantity.
- "fat": Estimated fat in grams for that quantity.

Calculate the totals for all items and place them in the "totals" object.

Example Input: "I had 2 boiled eggs and a bowl of oatmeal"
Example Output:
{
  "items": [
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
  ],
  "totals": {
    "calories": 313,
    "protein": 18.5,
    "carbs": 28.1,
    "fat": 14.2
  }
}
"""

def analyze_meal_text(query: str) -> MacroAnalysisResponse:
    try:
        # We combine the system prompt and the user query
        full_prompt = f"{SYSTEM_PROMPT}\n\nAnalyze this meal: \"{query}\""
        
        response = model.generate_content(full_prompt)
        
        # Clean the response text to ensure it's valid JSON
        json_text = response.text.strip().replace("```json", "").replace("```", "")
        
        # Parse the JSON string into our Pydantic model
        analysis_data = json.loads(json_text)
        
        # Validate data with Pydantic
        return MacroAnalysisResponse(**analysis_data)
        
    except Exception as e:
        print(f"Error during AI analysis: {e}")
        # You could return a structured error here if you want
        return None