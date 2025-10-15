import user from "./user.js";
import { createRecommendedMicros } from "./nutrientCalculator.js";

// Generate personalized nutrient targets
const needToday = createRecommendedMicros(user);
// Add calorie goal to the targets
needToday["Calories_kcal"] = user.calorieGoal;

const today = {
  "nutrients": {
    "Protein_g": 6.3,
    "Carbohydrates_g": 0.6,
    "Fats_g": 5,
    "Omega3_DHA_EPA_mg": 93,
    "Vitamin_B12_mcg": 0.45,
    "Choline_mg": 147,
    "Magnesium_mg": 5,
    "Iron_mg": 0.9,
    "Zinc_mg": 0.6,
    "Calcium_mg": 28,
    "Vitamin_D_mcg": 1.025,
    "Vitamin_C_mg": 0,
    "Fiber_g": 0,
    "Collagen_g": 0
  },
  "calories": 72,
  "food": {
    "Egg": 1
  }
};

export default {today, needToday};