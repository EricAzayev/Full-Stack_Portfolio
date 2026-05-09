// Utility functions for calculating personalized nutrient targets

// Base daily nutrient targets for a healthy adult on 2000 kcal diet
const baseMicros = {
  "Protein_g": 100,
  "Carbohydrates_g": 250,
  "Fats_g": 67,
  "Omega3_DHA_EPA_mg": 250,
  "Vitamin_B12_mcg": 2.4,
  "Choline_mg": 550,
  "Magnesium_mg": 400,
  "Iron_mg": 8,
  "Zinc_mg": 11,
  "Calcium_mg": 1000,
  "Vitamin_D_mcg": 15,     // 600 IU
  "Vitamin_C_mg": 90,
  "Fiber_g": 30,
  "Collagen_g": 10
};

// Activity multipliers (rough scaling factors)
const activityMultiplier = {
  sedentary: 1.0,
  light: 1.1,
  moderate: 1.25,
  active: 1.5,
  "very active": 1.75
};

// Gender adjustments (on average men need slightly more iron, protein, etc.)
const genderMultiplier = {
  male: {
    "Iron_mg": 1.0,      // 8 mg
    "Protein_g": 1.0,
    "Calcium_mg": 1.0
  },
  female: {
    "Iron_mg": 1.5,      // ~18 mg
    "Protein_g": 0.9,
    "Calcium_mg": 1.1
  }
};

// Age-based modifiers (older adults need more D, calcium, B12)
function ageAdjustment(age) {
  if (age < 30) return { "Vitamin_D_mcg": 1.0, "Calcium_mg": 1.0, "Vitamin_B12_mcg": 1.0 };
  if (age < 50) return { "Vitamin_D_mcg": 1.1, "Calcium_mg": 1.1, "Vitamin_B12_mcg": 1.1 };
  return { "Vitamin_D_mcg": 1.3, "Calcium_mg": 1.3, "Vitamin_B12_mcg": 1.2 };
}

// Function to generate personalized nutrient targets
export function createRecommendedMicros(user) {
  if (!user) {
    console.warn("createRecommendedMicros called with null/undefined user");
    return {};
  }
  const activityMult = activityMultiplier[user.activityLevel] || 1.0;
  const genderMult = genderMultiplier[user.gender] || {};
  const ageMult = ageAdjustment(user.age || 30);
  
  const weight = user.weight || 70; // Default to 70kg if missing
  const age = user.age || 30;
  const calorieGoal = user.calorieGoal || 2000;
  const calorieFactor = calorieGoal / 2000;

  const recommendedMicros = {};

  for (const [key, value] of Object.entries(baseMicros)) {
    let adjusted = value;
    
    // Weight-based calculations for protein (most important)
    if (key === "Protein_g") {
      // Protein: 0.8-2.2g per kg based on activity level
      // Sedentary: 0.8g/kg, Light: 1.0g/kg, Moderate: 1.2g/kg, Active: 1.6g/kg, Very Active: 2.0g/kg
      const proteinPerKg = {
        sedentary: 0.8,
        light: 1.0,
        moderate: 1.2,
        active: 1.6,
        "very active": 2.0
      }[user.activityLevel] || 1.0;
      
      adjusted = weight * proteinPerKg;
    }
    // Weight-based adjustments for minerals that scale with body mass
    else if (key === "Magnesium_mg" || key === "Zinc_mg" || key === "Iron_mg") {
      // Scale by weight relative to 70kg baseline
      const weightFactor = weight / 70;
      adjusted = value * weightFactor * activityMult;
    }
    // Fiber scales with calorie intake and activity
    else if (key === "Fiber_g") {
      adjusted = value * calorieFactor * activityMult;
    }
    // Standard calorie and activity scaling for others
    else {
      adjusted = value * calorieFactor * activityMult;
    }

    // Apply gender-specific multiplier if exists
    if (genderMult[key]) adjusted *= genderMult[key];

    // Apply age-specific multiplier if exists
    if (ageMult[key]) adjusted *= ageMult[key];

    recommendedMicros[key] = Number(adjusted.toFixed(2));
  }

  return recommendedMicros;
}

// Export the base data for file generation
export { baseMicros, activityMultiplier, genderMultiplier, ageAdjustment };
