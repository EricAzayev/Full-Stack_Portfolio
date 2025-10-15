import user from "./user.js";
import { createRecommendedMicros } from "./nutrientCalculator.js";

// Generate personalized nutrient targets
const needToday = createRecommendedMicros(user);
// Add calorie goal to the targets
needToday["Calories_kcal"] = user.calorieGoal;

const today = {
  "nutrients": {
    "Protein_g": 166.89999999999998,
    "Carbohydrates_g": 121.79999999999998,
    "Fats_g": 145,
    "Omega3_DHA_EPA_mg": 1509,
    "Vitamin_B12_mcg": 15.849999999999998,
    "Choline_mg": 2281,
    "Magnesium_mg": 335,
    "Iron_mg": 12.7,
    "Zinc_mg": 18.799999999999997,
    "Calcium_mg": 3324,
    "Vitamin_D_mcg": 27.825,
    "Vitamin_C_mg": 0,
    "Fiber_g": 0,
    "Collagen_g": 0
  },
  "calories": 2436,
  "food": {
    "Egg": 13,
    "Plain Yogurt": 10
  }
};

export default {today, needToday};