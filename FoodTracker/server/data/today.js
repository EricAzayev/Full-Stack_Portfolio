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
    "Protein_g": 33.7,
    "Carbohydrates_g": 13.8,
    "Fats_g": 28,
    "Omega3_DHA_EPA_mg": 402,
    "Vitamin_B12_mcg": 2.8,
    "Choline_mg": 625,
    "Magnesium_mg": 47,
    "Iron_mg": 3.7,
    "Zinc_mg": 3.5,
    "Calcium_mg": 408,
    "Vitamin_D_mcg": 5.549999999999999,
    "Vitamin_C_mg": 0,
    "Fiber_g": 0,
    "Collagen_g": 0
  },
  "calories": 438,
  "food": {
    "Egg": 4,
    "Plain Yogurt": 1
  }
};


export default {today, needToday}; 