import user from "./user.js";
import { createRecommendedMicros } from "./nutrientCalculator.js";

// Generate personalized nutrient targets
const needToday = createRecommendedMicros(user);
// Add calorie goal to the targets
needToday["Calories_kcal"] = user.calorieGoal;

const today = {
  "nutrients": {
    "Protein_g": 156,
    "Carbohydrates_g": 222,
    "Fats_g": 90,
    "Omega3_DHA_EPA_mg": 150,
    "Vitamin_B12_mcg": 4.499999999999999,
    "Choline_mg": 360,
    "Magnesium_mg": 420,
    "Iron_mg": 16.799999999999997,
    "Zinc_mg": 17.999999999999996,
    "Calcium_mg": 1050,
    "Vitamin_D_mcg": 0.6000000000000001,
    "Vitamin_C_mg": 57,
    "Fiber_g": 33,
    "Collagen_g": 0
  },
  "calories": 2400,
  "food": {
    "Chipotle Chicken Bowl": 3
  }
};

export default {today, needToday};