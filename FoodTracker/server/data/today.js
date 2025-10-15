import user from "./user.js";
import { createRecommendedMicros } from "./nutrientCalculator.js";

// Generate personalized nutrient targets
const needToday = createRecommendedMicros(user);
// Add calorie goal to the targets
needToday["Calories_kcal"] = user.calorieGoal;

const today = {
  "nutrients": {
    "Protein_g": 85.69999999999999,
    "Carbohydrates_g": 87.8,
    "Fats_g": 58,
    "Omega3_DHA_EPA_mg": 452,
    "Vitamin_B12_mcg": 4.3,
    "Choline_mg": 745,
    "Magnesium_mg": 187,
    "Iron_mg": 9.299999999999999,
    "Zinc_mg": 9.5,
    "Calcium_mg": 758,
    "Vitamin_D_mcg": 5.699999999999999,
    "Vitamin_C_mg": 19,
    "Fiber_g": 11,
    "Collagen_g": 0
  },
  "calories": 1166,
  "food": {
    "Egg": 4,
    "Chipotle Chicken Bowl": 1,
    "Plain Yogurt": 1
  }
};

export default {today, needToday};