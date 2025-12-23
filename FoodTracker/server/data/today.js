import user from "./user.js";
import { createRecommendedMicros } from "./nutrientCalculator.js";

// Generate personalized nutrient targets
const needToday = createRecommendedMicros(user);
// Add calorie goal to the targets
needToday["Calories_kcal"] = user.calorieGoal;

const today = {
  "nutrients": {
    "Protein_g": 0,
    "Carbohydrates_g": 0,
    "Fats_g": 0,
    "Omega3_DHA_EPA_mg": 0,
    "Vitamin_B12_mcg": 0,
    "Choline_mg": 0,
    "Magnesium_mg": 0,
    "Iron_mg": 0,
    "Zinc_mg": 0,
    "Calcium_mg": 0,
    "Vitamin_D_mcg": 0,
    "Vitamin_C_mg": 0,
    "Fiber_g": 0,
    "Collagen_g": 0
  },
  "calories": 0,
  "food": {}
};

export default {today, needToday};