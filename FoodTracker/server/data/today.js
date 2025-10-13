import user from "./user.js";

const recommendedMicros = {
  "Protein_g": 100,            // base for 2000 kcal
  "Carbohydrates_g": 250,
  "Fats_g": 67,
  "Omega3_DHA_EPA_mg": 250,
  "Vitamin_B12_mcg": 2.4,
  "Choline_mg": 550,
  "Magnesium_mg": 400,
  "Iron_mg": 8,
  "Zinc_mg": 11,
  "Calcium_mg": 1000,
  "Vitamin_D_mcg": 15,         // 600 IU
  "Vitamin_C_mg": 90,
  "Fiber_g": 30,
  "Collagen_g": 10
};

// activity multipliers
const activityMultiplier = {
  "sedentary": 1.0,
  "light": 1.1,
  "moderate": 1.25,
  "active": 1.5,
  "very active": 1.75
};

// pick multiplier
const mult = activityMultiplier[user.activityLevel] || 1.0;

// build nutrient targets dynamically
const needToday = Object.fromEntries(
  Object.entries(recommendedMicros).map(([key, value]) => [key, value * mult])
);

// also compute calorie target
needToday["Calories_kcal"] = user.calorieGoal;

const today = {
  "nutrients": {
    "Protein_g": 65.19999999999999,
    "Carbohydrates_g": 16.8,
    "Fats_g": 53,
    "Omega3_DHA_EPA_mg": 867,
    "Vitamin_B12_mcg": 5.050000000000001,
    "Choline_mg": 1360,
    "Magnesium_mg": 72,
    "Iron_mg": 8.200000000000001,
    "Zinc_mg": 6.499999999999998,
    "Calcium_mg": 548,
    "Vitamin_D_mcg": 10.675,
    "Vitamin_C_mg": 0,
    "Fiber_g": 0,
    "Collagen_g": 0
  },
  "calories": 798,
  "food": {
    "Egg": 9,
    "Plain Yogurt": 1
  }
};

export default {today, needToday};