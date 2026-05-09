import express from "express";
import { initDatabase } from "../database/db.js";
import * as foodDAL from "../dal/foodDAL.js";
import * as recordDAL from "../dal/recordDAL.js";
import * as userDAL from "../dal/userDAL.js";
import { createRecommendedMicros } from "../data/nutrientCalculator.js";

console.log("📍 [Routes] Food router loading with SQLite DAL...");

// Initialize database
initDatabase();
console.log("✅ [Routes] Database initialized");

const router = express.Router();

// Middleware to parse JSON
router.use(express.json());

// ============= FOOD LIBRARY ROUTES =============

/**
 * GET /api/foodLibrary
 * Get all foods in the library
 */
router.get("/foodLibrary", (req, res) => {
  try {
    const foodLibrary = foodDAL.getFoodLibraryLegacyFormat();
    res.status(200).json(foodLibrary);
  } catch (error) {
    console.error("Error getting food library:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/foodLibrary
 * Add new food to library
 */
router.post("/foodLibrary", (req, res) => {
  try {
    const { name, category, servingSize, calories, isProbiotic, nutrients } = req.body;

    // Validate required fields
    if (!name || !category || !servingSize || calories === undefined) {
      return res.status(400).json({ error: "Name, category, serving size, and calories are required" });
    }

    // Check if food already exists
    const existing = foodDAL.getFoodByName(name);
    if (existing) {
      return res.status(400).json({ error: "Food with this name already exists" });
    }

    // Validate numeric fields
    if (servingSize <= 0 || calories < 0) {
      return res.status(400).json({ error: "Serving size must be > 0 and calories must be >= 0" });
    }

    // Prepare food data
    const foodData = {
      name,
      category,
      servingSize: parseFloat(servingSize),
      calories: parseFloat(calories),
      isProbiotic: isProbiotic ? 1 : 0,
      protein_g: parseFloat(nutrients.Protein_g) || 0,
      carbohydrates_g: parseFloat(nutrients.Carbohydrates_g) || 0,
      fats_g: parseFloat(nutrients.Fats_g) || 0,
      omega3_dha_epa_mg: parseFloat(nutrients.Omega3_DHA_EPA_mg) || 0,
      vitamin_b12_mcg: parseFloat(nutrients.Vitamin_B12_mcg) || 0,
      choline_mg: parseFloat(nutrients.Choline_mg) || 0,
      magnesium_mg: parseFloat(nutrients.Magnesium_mg) || 0,
      iron_mg: parseFloat(nutrients.Iron_mg) || 0,
      zinc_mg: parseFloat(nutrients.Zinc_mg) || 0,
      calcium_mg: parseFloat(nutrients.Calcium_mg) || 0,
      vitamin_d_mcg: parseFloat(nutrients.Vitamin_D_mcg) || 0,
      vitamin_c_mg: parseFloat(nutrients.Vitamin_C_mg) || 0,
      fiber_g: parseFloat(nutrients.Fiber_g) || 0,
      collagen_g: parseFloat(nutrients.Collagen_g) || 0,
    };

    // Add food to database
    foodDAL.addFood(foodData);
    const updatedLibrary = foodDAL.getFoodLibraryLegacyFormat();

    console.log(`✅ [Routes] Added food "${name}" to library`);

    res.status(200).json({
      message: `Food "${name}" added successfully`,
      foodLibrary: updatedLibrary,
    });
  } catch (error) {
    console.error("Error adding food to library:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PUT /api/foodLibrary/:foodName
 * Update existing food
 */
router.put("/foodLibrary/:foodName", (req, res) => {
  try {
    const { foodName } = req.params;
    const { name, category, servingSize, calories, isProbiotic, nutrients } = req.body;

    // Validate required fields
    if (!name || !category || !servingSize || calories === undefined) {
      return res.status(400).json({ error: "Name, category, serving size, and calories are required" });
    }

    // Check if food exists
    const existing = foodDAL.getFoodByName(foodName);
    if (!existing) {
      return res.status(404).json({ error: "Food not found" });
    }

    // If name is changing, check if new name already exists
    if (name !== foodName && foodDAL.getFoodByName(name)) {
      return res.status(400).json({ error: "Food with this name already exists" });
    }

    // Validate numeric fields
    if (servingSize <= 0 || calories < 0) {
      return res.status(400).json({ error: "Serving size must be > 0 and calories must be >= 0" });
    }

    // Prepare food data
    const foodData = {
      name,
      category,
      servingSize: parseFloat(servingSize),
      calories: parseFloat(calories),
      isProbiotic: isProbiotic ? 1 : 0,
      protein_g: parseFloat(nutrients.Protein_g) || 0,
      carbohydrates_g: parseFloat(nutrients.Carbohydrates_g) || 0,
      fats_g: parseFloat(nutrients.Fats_g) || 0,
      omega3_dha_epa_mg: parseFloat(nutrients.Omega3_DHA_EPA_mg) || 0,
      vitamin_b12_mcg: parseFloat(nutrients.Vitamin_B12_mcg) || 0,
      choline_mg: parseFloat(nutrients.Choline_mg) || 0,
      magnesium_mg: parseFloat(nutrients.Magnesium_mg) || 0,
      iron_mg: parseFloat(nutrients.Iron_mg) || 0,
      zinc_mg: parseFloat(nutrients.Zinc_mg) || 0,
      calcium_mg: parseFloat(nutrients.Calcium_mg) || 0,
      vitamin_d_mcg: parseFloat(nutrients.Vitamin_D_mcg) || 0,
      vitamin_c_mg: parseFloat(nutrients.Vitamin_C_mg) || 0,
      fiber_g: parseFloat(nutrients.Fiber_g) || 0,
      collagen_g: parseFloat(nutrients.Collagen_g) || 0,
    };

    // Update food in database
    foodDAL.updateFood(foodName, foodData);
    const updatedLibrary = foodDAL.getFoodLibraryLegacyFormat();

    console.log(`✅ [Routes] Updated food "${foodName}" to "${name}"`);

    res.status(200).json({
      message: `Food "${name}" updated successfully`,
      foodLibrary: updatedLibrary,
    });
  } catch (error) {
    console.error("Error updating food:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /api/foodLibrary/:foodName
 * Delete food from library
 */
router.delete("/foodLibrary/:foodName", (req, res) => {
  try {
    const { foodName } = req.params;

    // Check if food exists
    const existing = foodDAL.getFoodByName(foodName);
    if (!existing) {
      return res.status(404).json({ error: "Food not found" });
    }

    // Delete food (will be stored in deleted_foods table)
    foodDAL.deleteFood(foodName);
    const updatedLibrary = foodDAL.getFoodLibraryLegacyFormat();

    console.log(`✅ [Routes] Deleted food "${foodName}" from library`);

    res.status(200).json({
      message: `Food "${foodName}" deleted successfully`,
      foodLibrary: updatedLibrary,
    });
  } catch (error) {
    console.error("Error deleting food:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ============= TODAY ROUTES =============

/**
 * GET /api/today
 * Get today's nutrition data
 */
router.get("/today", (req, res) => {
  try {
    // Check if we need to reset (new day)
    const lastResetDate = recordDAL.getLastResetDate();
    const currentDate = new Date().toDateString();

    if (lastResetDate !== currentDate) {
      console.log(`🔄 [Routes] New day detected. Last reset: ${lastResetDate}, Current: ${currentDate}`);
      
      // Clear deleted foods
      foodDAL.clearDeletedFoods();
      
      // Update last reset date
      recordDAL.updateLastResetDate(currentDate);
      
      console.log("✅ [Routes] Daily reset completed");
    }

    // Get today's data
    const today = recordDAL.getTodayLegacyFormat();
    
    // Get user for nutrient recommendations
    const user = userDAL.getUser();
    const needToday = user ? createRecommendedMicros(user) : {};
    if (user) {
      needToday["Calories_kcal"] = user.calorieGoal;
    }

    res.status(200).json({ today, needToday });
  } catch (error) {
    console.error("Error getting today's data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PUT /api/today
 * Update today's nutrition (add/remove food servings)
 * Supports two modes:
 * - mode='add': servings is a delta to add (default for backward compatibility)
 * - mode='set': servings is the new absolute total
 */
router.put("/today", (req, res) => {
  try {
    const { foodName, servings, mode } = req.body;

    // Validate required fields
    if (!foodName || servings === undefined) {
      return res.status(400).json({ error: "Food name and servings are required" });
    }

    // Check if food exists in library or deleted library
    let food = foodDAL.getFoodByName(foodName);
    const deletedFoods = foodDAL.getDeletedFoods();
    
    if (!food && !deletedFoods[foodName]) {
      return res.status(404).json({ error: `Food "${foodName}" not found` });
    }

    let servingsDelta;
    
    if (mode === 'set') {
      // Calculate delta from current servings
      const currentToday = recordDAL.getTodayLegacyFormat();
      const currentServings = currentToday.food[foodName] || 0;
      servingsDelta = servings - currentServings;
      console.log(`✅ [Routes] Setting ${foodName}: ${currentServings} -> ${servings} (delta: ${servingsDelta})`);
    } else {
      // Default: treat servings as delta (add/subtract)
      servingsDelta = servings;
      console.log(`✅ [Routes] Adding to ${foodName}: ${servings > 0 ? '+' : ''}${servings}`);
    }

    // Update today's record with the delta
    recordDAL.updateTodayFood(foodName, servingsDelta);
    
    // Get updated data
    const today = recordDAL.getTodayLegacyFormat();
    const user = userDAL.getUser();
    const needToday = user ? createRecommendedMicros(user) : {};
    if (user) {
      needToday["Calories_kcal"] = user.calorieGoal;
    }

    res.status(200).json({ today, needToday });
  } catch (error) {
    console.error("Error updating today's data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /api/today
 * Manually reset today's data
 */
router.delete("/today", (req, res) => {
  try {
    // Reset today's record
    recordDAL.resetTodayRecord();
    
    // Clear deleted foods
    foodDAL.clearDeletedFoods();
    
    // Update last reset date
    recordDAL.updateLastResetDate(new Date().toDateString());

    // Get fresh data
    const today = recordDAL.getTodayLegacyFormat();
    const user = userDAL.getUser();
    const needToday = user ? createRecommendedMicros(user) : {};
    if (user) {
      needToday["Calories_kcal"] = user.calorieGoal;
    }

    console.log("✅ [Routes] Manual reset completed");

    res.status(200).json({ 
      message: "Today's data reset successfully",
      today,
      needToday
    });
  } catch (error) {
    console.error("Error resetting today's data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ============= RECORDS ROUTES =============

/**
 * GET /api/records
 * Get all historical records
 */
router.get("/records", (req, res) => {
  try {
    const records = recordDAL.getAllRecordsLegacyFormat();
    res.status(200).json(records);
  } catch (error) {
    console.error("Error getting records:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ============= RECOMMENDATIONS ROUTES =============

/**
 * GET /api/recommendations
 * Get nutrient recommendations for the current user
 */
router.get("/recommendations", (req, res) => {
  try {
    const userData = userDAL.getUser();
    
    if (!userData) {
      return res.status(404).json({ error: "User profile not found" });
    }
    
    const recommendations = createRecommendedMicros(userData);
    recommendations["Calories_kcal"] = userData.calorieGoal || 2000;
    
    console.log(`✅ [Routes] Fetched recommendations for user`);
    
    res.status(200).json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/recommendations/calculate
 * Calculate nutrient recommendations using standard formula
 */
router.post("/recommendations/calculate", (req, res) => {
  try {
    const userData = req.body;
    
    // Validate required fields
    if (!userData.age || !userData.gender || !userData.activityLevel) {
      return res.status(400).json({ error: "Missing required user data" });
    }
    
    console.log(`📊 [Standard Formula] Calculating for user:`, {
      age: userData.age,
      gender: userData.gender,
      weight: userData.weight,
      height: userData.height,
      activityLevel: userData.activityLevel,
      calorieGoal: userData.calorieGoal
    });
    
    const recommendations = createRecommendedMicros(userData);
    recommendations["Calories_kcal"] = userData.calorieGoal || 2000;
    
    console.log(`✅ [Standard Formula] Calculated recommendations:`, recommendations);
    
    res.status(200).json(recommendations);
  } catch (error) {
    console.error("Error calculating recommendations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/smart-recommendations
 * Get smart food recommendations based on nutrient deficits
 */
router.get("/smart-recommendations", (req, res) => {
  try {
    // Get today's nutrition data
    const today = recordDAL.getTodayLegacyFormat();
    
    // Get user profile and calculate nutrient targets
    const user = userDAL.getUser();
    if (!user) {
      return res.status(400).json({ error: "User profile not found" });
    }

    const needToday = createRecommendedMicros(user);
    needToday["Calories_kcal"] = user.calorieGoal;

    // Calculate nutrient deficits (what's missing)
    const nutrientDeficits = [];
    const totalCaloriesConsumed = today.calories || 0;
    const remainingCalories = Math.max(0, user.calorieGoal - totalCaloriesConsumed);
    const consumedNutrients = today.nutrients || {};

    for (const [nutrient, target] of Object.entries(needToday)) {
      const consumed = consumedNutrients[nutrient] || 0;
      const deficit = target - consumed;
      const percentMet = target > 0 ? (consumed / target) * 100 : 100;

      // Only consider deficits where less than 90% of the need is met
      if (deficit > 0 && percentMet < 90) {
        nutrientDeficits.push({
          nutrient,
          deficit,
          percentMet,
        });
      }
    }

    // Sort by lowest percentage met (biggest gaps first)
    nutrientDeficits.sort((a, b) => a.percentMet - b.percentMet);

    // Get all foods from library
    const foodLibrary = foodDAL.getFoodLibraryLegacyFormat();
    const foodScores = [];

    for (const [foodName, foodData] of Object.entries(foodLibrary)) {
      const nutrients = foodData.Nutrients || {};
      const metadata = foodData.Metadata || {};
      const caloriesPerServing = metadata.Calories_kcal || 0;

      // Skip if exceeds remaining calories significantly
      if (caloriesPerServing > remainingCalories && remainingCalories > 100) continue;

      let score = 0;
      let nutrientsProvided = [];

      // Check how much this food helps with each deficit
      for (let i = 0; i < nutrientDeficits.length; i++) {
        const deficit = nutrientDeficits[i];
        const nutrientKey = deficit.nutrient;
        const foodNutrientValue = nutrients[nutrientKey] || 0;
        const target = needToday[nutrientKey];

        if (foodNutrientValue > 0) {
          // Calculate what % of the deficit this food fills
          const percentOfDeficit = (foodNutrientValue / deficit.deficit) * 100;

          // Calculate what % of the TOTAL daily need this food provides
          const percentOfDailyNeed = target > 0 ? (foodNutrientValue / target) * 100 : 0;

          if (percentOfDeficit > 5) {
            // Weight by priority: top gaps get much higher weight
            const priorityWeight = Math.max(1, 3 - i * 0.15);
            const weightedScore = percentOfDeficit * priorityWeight;

            score += weightedScore;
            nutrientsProvided.push({
              nutrient: nutrientKey,
              amount: foodNutrientValue,
              percentOfDeficit: Math.round(percentOfDeficit),
              percentOfDailyNeed: Math.round(percentOfDailyNeed),
            });
          }
        }
      }

      // Only include foods that actually help
      if (score > 0 && nutrientsProvided.length > 0) {
        foodScores.push({
          foodName,
          score,
          caloriesPerServing,
          servingSize: metadata.ServingSize_g || 100,
          category: metadata.Category || "",
          nutrientsProvided: nutrientsProvided.sort((a, b) => b.percentOfDeficit - a.percentOfDeficit),
        });
      }
    }

    // Sort by score (best matches first)
    foodScores.sort((a, b) => b.score - a.score);

    // Format top 15 recommendations
    const recommendations = foodScores.slice(0, 15).map((food) => {
      // Get top 2 nutrients this food helps with
      const topFills = food.nutrientsProvided
        .slice(0, 2)
        .map((n) => ({
          nutrient: n.nutrient.replace(/_/g, " ").replace(/\s*(mcg|mg|g|kcal)\s*/gi, "").trim(),
          amount: n.amount,
          percentOfDailyNeed: n.percentOfDailyNeed,
        }));

      return {
        foodName: food.foodName,
        calories: food.caloriesPerServing,
        servingSize: food.servingSize,
        category: food.category,
        topFills: topFills,
      };
    });

    // Format top 5 nutrient gaps
    const topGaps = nutrientDeficits.slice(0, 5).map((d) => ({
      nutrient: d.nutrient.replace(/_/g, " ").replace(/\s*(mcg|mg|g|kcal)\s*/gi, "").trim(),
      percentMet: Math.round(d.percentMet),
    }));

    console.log(`✅ [Routes] Generated ${recommendations.length} smart recommendations`);

    res.status(200).json({
      remainingCalories,
      nutrientGaps: topGaps,
      recommendations,
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ============= USER ROUTES =============

/**
 * GET /api/user
 * Get user profile
 */
router.get("/user", (req, res) => {
  try {
    const user = userDAL.getUser();
    if (!user) {
      return res.status(404).json({ error: "User profile not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/user
 * Create or update user profile
 */
router.post("/user", (req, res) => {
  try {
    const { name, age, gender, height, weight, activityLevel, calorieGoal } = req.body;

    // Validate required fields
    if (!name || !age || !gender || !height || !weight || !activityLevel || !calorieGoal) {
      return res.status(400).json({ error: "All user fields are required" });
    }

    // Validate numeric fields
    if (age <= 0 || height <= 0 || weight <= 0 || calorieGoal <= 0) {
      return res.status(400).json({ error: "Numeric fields must be positive" });
    }

    // Validate gender
    if (!["male", "female", "other"].includes(gender)) {
      return res.status(400).json({ error: "Invalid gender value" });
    }

    // Validate activity level
    const validActivityLevels = ["sedentary", "light", "moderate", "active", "very_active"];
    if (!validActivityLevels.includes(activityLevel)) {
      return res.status(400).json({ error: "Invalid activity level" });
    }

    // Save user profile
    const userData = {
      name,
      age: parseInt(age),
      gender,
      height: parseFloat(height),
      weight: parseFloat(weight),
      activityLevel,
      calorieGoal: parseInt(calorieGoal),
    };

    const savedUser = userDAL.saveUser(userData);

    console.log(`✅ [Routes] User profile saved: ${name}`);

    res.status(200).json({
      message: "User profile saved successfully",
      user: savedUser,
    });
  } catch (error) {
    console.error("Error saving user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ============= DELETED FOODS ROUTES =============

/**
 * GET /api/deletedFoods
 * Get deleted foods (for removing from today)
 */
router.get("/deletedFoods", (req, res) => {
  try {
    const deletedFoods = foodDAL.getDeletedFoods();
    res.status(200).json(deletedFoods);
  } catch (error) {
    console.error("Error getting deleted foods:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

console.log("✅ [Routes] Food router loaded with SQLite DAL");

export default router;
