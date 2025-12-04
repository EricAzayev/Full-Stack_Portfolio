import user from "./user.js";
import { createRecommendedMicros } from "./nutrientCalculator.js";

// Generate personalized nutrient targets
const needToday = createRecommendedMicros(user);
// Add calorie goal to the targets
needToday["Calories_kcal"] = user.calorieGoal;

const today = {
  "nutrients": {
    "Protein_g": 126.8,
    "Carbohydrates_g": 77.6,
    "Fats_g": 64,
    "Omega3_DHA_EPA_mg": 623,
    "Vitamin_B12_mcg": 4.499999999999999,
    "Choline_mg": 1087,
    "Magnesium_mg": 202,
    "Iron_mg": 11.899999999999999,
    "Zinc_mg": 10.600000000000001,
    "Calcium_mg": 530,
    "Vitamin_D_mcg": 6.449999999999998,
    "Vitamin_C_mg": 19,
    "Fiber_g": 11,
    "Collagen_g": 1.2
  },
  "calories": 1430,
  "food": {
    "Egg": 6,
    "Chipotle Chicken Bowl": 1,
    "Chicken Breast": 1
  }
};

export default {today, needToday};