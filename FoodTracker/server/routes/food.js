import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getDataDir, getDataFileUrl } from "../utils/pathUtils.js";

console.log("📍 [Routes] Food router loading...");
console.log("📍 [Routes] Data Directory resolved to:", getDataDir());

// Import with error handling
let foodLibrary, todayData, lastResetData, record, user, foodDeletedLibrary, createRecommendedMicros;

try {
  const url = getDataFileUrl("foodLibrary.js");
  console.log("📍 [Routes] Importing foodLibrary from:", url);
  foodLibrary = (await import(url)).default;
  console.log("✅ [Routes] foodLibrary imported. Keys:", Object.keys(foodLibrary).length);
} catch (e) {
  console.error("❌ [Routes] Failed to import foodLibrary:", e.message);
  foodLibrary = {};
}

try {
  const url = getDataFileUrl("today.js");
  console.log("📍 [Routes] Importing todayData from:", url);
  todayData = (await import(url)).default;
  console.log("✅ [Routes] todayData imported:", JSON.stringify(todayData));
} catch (e) {
  console.error("❌ [Routes] Failed to import todayData:", e.message);
  todayData = { today: {}, needToday: {} };
}

try {
  const url = getDataFileUrl("nutrientCalculator.js");
  console.log("📍 [Routes] Importing nutrientCalculator from:", url);
  createRecommendedMicros = (await import(url)).createRecommendedMicros;
  console.log("✅ [Routes] nutrientCalculator imported");
} catch (e) {
  console.error("❌ [Routes] Failed to import nutrientCalculator:", e.message);
  createRecommendedMicros = () => ({});
}

try {
  const url = getDataFileUrl("lastReset.js");
  console.log("📍 [Routes] Importing lastResetData from:", url);
  lastResetData = (await import(url)).default;
  console.log("✅ [Routes] lastResetData imported:", JSON.stringify(lastResetData));
} catch (e) {
  console.error("❌ [Routes] Failed to import lastResetData:", e.message);
  lastResetData = { lastResetDate: new Date().toDateString() };
}

try {
  const url = getDataFileUrl("record.js");
  console.log("📍 [Routes] Importing record from:", url);
  record = (await import(url)).default;
  console.log("✅ [Routes] record imported. Count:", record.records?.length || 0);
} catch (e) {
  console.error("❌ [Routes] Failed to import record:", e.message);
  record = {};
}

try {
  const url = getDataFileUrl("user.js");
  console.log("📍 [Routes] Importing user from:", url);
  user = (await import(url)).default;
  console.log("✅ [Routes] user imported:", user.name);
} catch (e) {
  console.error("❌ [Routes] Failed to import user:", e.message);
  user = {};
}

try {
  const url = getDataFileUrl("foodDeletedLibrary.js");
  console.log("📍 [Routes] Importing foodDeletedLibrary from:", url);
  foodDeletedLibrary = (await import(url)).default;
  console.log("✅ [Routes] foodDeletedLibrary imported");
} catch (e) {
  console.error("❌ [Routes] Failed to import foodDeletedLibrary:", e.message);
  foodDeletedLibrary = {};
}

let { today, needToday } = todayData;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
console.log("📍 [Routes] Express router created");

// Track if reset has been performed in this session to prevent multiple resets
let resetPerformedToday = false;

// Helper function to generate today.js file content with personalized nutrient targets
function generateTodayFileContent(todayData) {
  return `import user from "./user.js";
import { createRecommendedMicros } from "./nutrientCalculator.js";

// Generate personalized nutrient targets
const needToday = createRecommendedMicros(user);
// Add calorie goal to the targets
needToday["Calories_kcal"] = user.calorieGoal;

const today = ${JSON.stringify(todayData, null, 2)};

export default {today, needToday};`;
}

// Middleware to parse JSON
router.use(express.json());

// Route to serve foodLibrary data
router.get("/foodLibrary", (req, res) => {
  res.status(200).json(foodLibrary);
});

// Route to add new food to foodLibrary
router.post("/foodLibrary", (req, res) => {
  try {
    const { name, category, servingSize, calories, isProbiotic, nutrients } = req.body;

    // Validate required fields
    if (!name || !category || !servingSize || calories === undefined) {
      return res.status(400).json({ error: "Name, category, serving size, and calories are required" });
    }

    // Check if food already exists
    if (foodLibrary[name]) {
      return res.status(400).json({ error: "Food with this name already exists" });
    }

    // Validate numeric fields
    if (servingSize <= 0 || calories < 0) {
      return res.status(400).json({ error: "Serving size must be > 0 and calories must be >= 0" });
    }

    // Create the new food entry with the same structure as existing foods
    const newFood = {
      Metadata: {
        Category: category,
        ServingSize_g: parseFloat(servingSize),
        Calories_kcal: parseFloat(calories),
        IsProbiotic: Boolean(isProbiotic)
      },
      Nutrients: {
        Protein_g: parseFloat(nutrients.Protein_g) || 0,
        Carbohydrates_g: parseFloat(nutrients.Carbohydrates_g) || 0,
        Fats_g: parseFloat(nutrients.Fats_g) || 0,
        Omega3_DHA_EPA_mg: parseFloat(nutrients.Omega3_DHA_EPA_mg) || 0,
        Vitamin_B12_mcg: parseFloat(nutrients.Vitamin_B12_mcg) || 0,
        Choline_mg: parseFloat(nutrients.Choline_mg) || 0,
        Magnesium_mg: parseFloat(nutrients.Magnesium_mg) || 0,
        Iron_mg: parseFloat(nutrients.Iron_mg) || 0,
        Zinc_mg: parseFloat(nutrients.Zinc_mg) || 0,
        Calcium_mg: parseFloat(nutrients.Calcium_mg) || 0,
        Vitamin_D_mcg: parseFloat(nutrients.Vitamin_D_mcg) || 0,
        Vitamin_C_mg: parseFloat(nutrients.Vitamin_C_mg) || 0,
        Fiber_g: parseFloat(nutrients.Fiber_g) || 0,
        Collagen_g: parseFloat(nutrients.Collagen_g) || 0
      },
      CollagenSupport: {
        DerivedFrom: ["Protein_g"],
        SupportsCollagenSynthesis: true
      },
      Supports: {
        Brain: ["Omega3_DHA_EPA_mg", "Vitamin_B12_mcg", "Choline_mg", "Magnesium_mg", "Iron_mg"],
        Muscle: ["Protein_g", "Vitamin_D_mcg", "Magnesium_mg", "Iron_mg", "Zinc_mg", "Calcium_mg"],
        Skin: ["Omega3_DHA_EPA_mg", "CollagenSupport", "Zinc_mg"]
      },
      Synergy: {
        Vitamin_D_mcg: ["Calcium_mg"]
      }
    };

    // Add the new food to the library
    foodLibrary[name] = newFood;

    // Write updated food library to file
    const foodLibraryFilePath = path.join(getDataDir(), "foodLibrary.js");
    const foodLibraryFileContent = `const foodLibrary = ${JSON.stringify(foodLibrary, null, 2)}

export default foodLibrary;`;

    fs.writeFileSync(foodLibraryFilePath, foodLibraryFileContent);
    console.log("💾 [Routes] Saved foodLibrary.js to:", foodLibraryFilePath);
    console.log(`New food "${name}" added to food library`);

    res.status(200).json({
      message: `Food "${name}" added successfully`,
      foodLibrary: foodLibrary
    });
  } catch (error) {
    console.error("Error adding food to library:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to update an existing food in foodLibrary
router.put("/foodLibrary/:foodName", (req, res) => {
  try {
    const { foodName } = req.params;
    const { name, category, servingSize, calories, isProbiotic, nutrients } = req.body;

    // Validate required fields
    if (!name || !category || !servingSize || calories === undefined) {
      return res.status(400).json({ error: "Name, category, serving size, and calories are required" });
    }

    // Check if the food exists
    if (!foodLibrary[foodName]) {
      return res.status(404).json({ error: "Food not found" });
    }

    // If the name is being changed, check if the new name already exists
    if (name !== foodName && foodLibrary[name]) {
      return res.status(400).json({ error: "Food with this name already exists" });
    }

    // Validate numeric fields
    if (servingSize <= 0 || calories < 0) {
      return res.status(400).json({ error: "Serving size must be > 0 and calories must be >= 0" });
    }

    // Create the updated food entry
    const updatedFood = {
      Metadata: {
        Category: category,
        ServingSize_g: parseFloat(servingSize),
        Calories_kcal: parseFloat(calories),
        IsProbiotic: Boolean(isProbiotic)
      },
      Nutrients: {
        Protein_g: parseFloat(nutrients.Protein_g) || 0,
        Carbohydrates_g: parseFloat(nutrients.Carbohydrates_g) || 0,
        Fats_g: parseFloat(nutrients.Fats_g) || 0,
        Omega3_DHA_EPA_mg: parseFloat(nutrients.Omega3_DHA_EPA_mg) || 0,
        Vitamin_B12_mcg: parseFloat(nutrients.Vitamin_B12_mcg) || 0,
        Choline_mg: parseFloat(nutrients.Choline_mg) || 0,
        Magnesium_mg: parseFloat(nutrients.Magnesium_mg) || 0,
        Iron_mg: parseFloat(nutrients.Iron_mg) || 0,
        Zinc_mg: parseFloat(nutrients.Zinc_mg) || 0,
        Calcium_mg: parseFloat(nutrients.Calcium_mg) || 0,
        Vitamin_D_mcg: parseFloat(nutrients.Vitamin_D_mcg) || 0,
        Vitamin_C_mg: parseFloat(nutrients.Vitamin_C_mg) || 0,
        Fiber_g: parseFloat(nutrients.Fiber_g) || 0,
        Collagen_g: parseFloat(nutrients.Collagen_g) || 0
      },
      CollagenSupport: {
        DerivedFrom: ["Protein_g"],
        SupportsCollagenSynthesis: true
      },
      Supports: {
        Brain: ["Omega3_DHA_EPA_mg", "Vitamin_B12_mcg", "Choline_mg", "Magnesium_mg", "Iron_mg"],
        Muscle: ["Protein_g", "Vitamin_D_mcg", "Magnesium_mg", "Iron_mg", "Zinc_mg", "Calcium_mg"],
        Skin: ["Omega3_DHA_EPA_mg", "CollagenSupport", "Zinc_mg"]
      },
      Synergy: {
        Vitamin_D_mcg: ["Calcium_mg"]
      }
    };

    // If the name is being changed, remove the old entry and add the new one
    if (name !== foodName) {
      delete foodLibrary[foodName];
    }

    // Add/update the food in the library
    foodLibrary[name] = updatedFood;

    // Write updated food library to file
    const foodLibraryFilePath = path.join(getDataDir(), "foodLibrary.js");
    const foodLibraryFileContent = `const foodLibrary = ${JSON.stringify(foodLibrary, null, 2)}

export default foodLibrary;`;

    fs.writeFileSync(foodLibraryFilePath, foodLibraryFileContent);
    console.log("💾 [Routes] Saved foodLibrary.js to:", foodLibraryFilePath);

    console.log(`Food "${foodName}" updated to "${name}" in food library`);

    res.status(200).json({
      message: `Food "${name}" updated successfully`,
      foodLibrary: foodLibrary
    });
  } catch (error) {
    console.error("Error updating food in library:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to delete a food from foodLibrary
router.delete("/foodLibrary/:foodName", (req, res) => {
  try {
    const { foodName } = req.params;

    // Check if the food exists
    if (!foodLibrary[foodName]) {
      return res.status(404).json({ error: "Food not found" });
    }

    // Move the food to deletedLibrary before removing (for today's intake cleanup)
    foodDeletedLibrary[foodName] = foodLibrary[foodName];

    // Remove the food from the library
    delete foodLibrary[foodName];

    // Write updated food library to file
    const foodLibraryFilePath = path.join(getDataDir(), "foodLibrary.js");
    const foodLibraryFileContent = `const foodLibrary = ${JSON.stringify(foodLibrary, null, 2)}

export default foodLibrary;`;

    fs.writeFileSync(foodLibraryFilePath, foodLibraryFileContent);
    console.log("💾 [Routes] Saved foodLibrary.js to:", foodLibraryFilePath);

    // Write updated deleted library to file
    const deletedLibraryFilePath = path.join(getDataDir(), "foodDeletedLibrary.js");
    const deletedLibraryFileContent = `// Temporary storage for deleted foods (cleared daily)
// This allows users to remove deleted foods from today's intake
const foodDeletedLibrary = ${JSON.stringify(foodDeletedLibrary, null, 2)};

export default foodDeletedLibrary;`;

    fs.writeFileSync(deletedLibraryFilePath, deletedLibraryFileContent);
    console.log("💾 [Routes] Saved foodDeletedLibrary.js to:", deletedLibraryFilePath);

    console.log(`Food "${foodName}" deleted from food library and moved to temporary deleted library`);

    res.status(200).json({
      message: `Food "${foodName}" deleted successfully`,
      foodLibrary: foodLibrary
    });
  } catch (error) {
    console.error("Error deleting food from library:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to update food quantity in today's intake
router.put("/today", (req, res) => {
  try {
    console.log("PUT /today route called with body:", req.body);
    const { foodName, servings } = req.body;

    if (!foodName || servings === undefined) {
      return res.status(400).json({ error: "Invalid food name or servings" });
    }

    // Check if food exists in today's intake
    if (!today.food[foodName]) {
      return res.status(400).json({ error: "Food not found in today's intake" });
    }

    // Get current servings of this food
    const currentServings = today.food[foodName] || 0;
    const servingsDifference = servings - currentServings;

    // Update today's data
    const updatedToday = {
      ...today,
      nutrients: { ...today.nutrients },
      food: { ...today.food }
    };

    // Try to get food data from library or deleted library
    const foodData = foodLibrary[foodName] || foodDeletedLibrary[foodName];

    if (!foodData) {
      return res.status(400).json({
        error: `Cannot find nutrient data for ${foodName}. Food may have been deleted before being added to today's intake.`
      });
    }

    // Get nutrients from the food data
    const nutrients = foodData.Nutrients;

    // Special case: If removing (servings <= 0)
    if (servings <= 0) {
      // Subtract the calories
      updatedToday.calories -= foodData.Metadata.Calories_kcal * currentServings;

      // Subtract the nutrients
      Object.keys(nutrients).forEach((nutrient) => {
        if (typeof nutrients[nutrient] === "number") {
          updatedToday.nutrients[nutrient] -= nutrients[nutrient] * currentServings;
          // Ensure no negative values
          updatedToday.nutrients[nutrient] = Math.max(0, updatedToday.nutrients[nutrient]);
        }
      });

      console.log(`Removed ${foodName} and subtracted nutrients (from ${foodLibrary[foodName] ? 'library' : 'deleted library'})`);

      // Remove from food list
      delete updatedToday.food[foodName];

      // Ensure calories is not negative
      updatedToday.calories = Math.max(0, updatedToday.calories);
    } else {
      // Normal update (works for both active and deleted foods)
      // Update calories
      updatedToday.calories += foodData.Metadata.Calories_kcal * servingsDifference;

      // Update nutrients
      Object.keys(nutrients).forEach((nutrient) => {
        if (typeof nutrients[nutrient] === "number") {
          updatedToday.nutrients[nutrient] += nutrients[nutrient] * servingsDifference;
          // Ensure no negative values
          updatedToday.nutrients[nutrient] = Math.max(0, updatedToday.nutrients[nutrient]);
        }
      });

      // Update food servings
      updatedToday.food[foodName] = servings;

      // Ensure calories is not negative
      updatedToday.calories = Math.max(0, updatedToday.calories);

      if (foodDeletedLibrary[foodName]) {
        console.log(`Updated ${foodName} servings (food is in deleted library, will be removed at daily reset)`);
      }
    }

    // Update the in-memory today object
    today.calories = updatedToday.calories;
    today.nutrients = updatedToday.nutrients;
    today.food = updatedToday.food;

    // Write updated data to file
    const todayFilePath = path.join(getDataDir(), "today.js");
    const todayFileContent = generateTodayFileContent(updatedToday);

    fs.writeFileSync(todayFilePath, todayFileContent);
    console.log("💾 [Routes] Saved today.js to:", todayFilePath);

    console.log(`Updated ${foodName} to ${servings} servings in today's intake`);

    res.status(200).json({
      message: `Updated ${foodName} to ${servings} servings`,
      updatedToday: updatedToday,
      needToday: needToday
    });
  } catch (error) {
    console.error("Error updating food quantity:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Function to check if we need to reset for a new day
const shouldResetForNewDay = () => {
  const now = new Date();
  const todayString = now.toDateString();

  // If no last reset date or it's a different day, AND we haven't already reset in this session
  return lastResetData.lastResetDate !== todayString && !resetPerformedToday;
};

// Function to create a fresh today object
const createFreshToday = () => ({
  nutrients: {
    Protein_g: 0,
    Carbohydrates_g: 0,
    Fats_g: 0,
    Omega3_DHA_EPA_mg: 0,
    Vitamin_B12_mcg: 0,
    Choline_mg: 0,
    Magnesium_mg: 0,
    Iron_mg: 0,
    Zinc_mg: 0,
    Calcium_mg: 0,
    Vitamin_D_mcg: 0,
    Vitamin_C_mg: 0,
    Fiber_g: 0,
    Collagen_g: 0,
  },
  calories: 0,
  food: {}
});

// Getter and setter functions for data
const getToday = () => today;
const setToday = (newToday) => {
  today = newToday;
};

const getUser = () => user;
const setUser = (newUser) => {
  user = newUser;
};

const getFoodLibrary = () => foodLibrary;
const setDeletedFoodLibrary = (newLib) => {
  foodDeletedLibrary = newLib;
};

const getRecords = () => record;

const saveDailyRecord = (todayData) => {
  try {
    if (!record[new Date().toDateString()]) {
      record[new Date().toDateString()] = todayData;
    }
    // Write record to file
    const recordFilePath = path.join(getDataDir(), "record.js");
    const recordFileContent = `const record = ${JSON.stringify(record, null, 2)}

export default record;`;
    fs.writeFileSync(recordFilePath, recordFileContent);
    console.log("💾 [Routes] Saved record.js to:", recordFilePath);
    console.log("Daily record saved");
  } catch (error) {
    console.error("Error saving daily record:", error);
  }
};

// Router endpoints

// GET /today - Retrieve today's data
router.get("/today", async (req, res) => {
  try {
    // DYNAMIC IMPORT: Force reload from file to ensure we carry over data
    // This is crucial because nodemon ignores the data folder, so the server process 
    // persists while the file changes. We need to read the file again.
    const todayUrl = getDataFileUrl("today.js") + "?t=" + Date.now(); // Cache busting
    const userUrl = getDataFileUrl("user.js") + "?t=" + Date.now();

    try {
      const todayModule = await import(todayUrl);
      todayData = todayModule.default || { today: {}, needToday: {} };
      // Update in-memory reference
      today = todayData.today;
    } catch (e) {
      console.error("Error re-importing today.js:", e);
    }

    try {
      const userModule = await import(userUrl);
      user = userModule.default || {};
    } catch (e) {
      console.error("Error re-importing user.js:", e);
    }

    // Read current data from JSON storage
    const currentToday = getToday();
    const currentUser = getUser();
    const needToday = createRecommendedMicros(currentUser);
    needToday["Calories_kcal"] = currentUser.calorieGoal;

    // Check if we need to reset for a new day
    if (shouldResetForNewDay()) {
      console.log("New day detected, saving record and resetting data...");

      // Save today's data to record before resetting (only if there's data to save)
      if (currentToday.calories > 0 || (currentToday.food && Object.keys(currentToday.food).length > 0)) {
        saveDailyRecord(currentToday);
      }

      // Create fresh today data
      const freshToday = createFreshToday();

      // Save fresh today data to JSON storage
      setToday(freshToday);

      // Update the lastReset file
      const newLastResetData = {
        lastResetDate: new Date().toDateString(),
      };
      // Note: Ideally would use dataStorage.js for this too

      // Clear the deleted foods library (new day, fresh start)
      setDeletedFoodLibrary({});
      console.log("Cleared deleted foods library");

      // Set the session flag to prevent multiple resets
      resetPerformedToday = true;

      console.log("Daily reset completed successfully");

      res.status(200).json({ today: freshToday, needToday });
    } else {
      res.status(200).json({ today: currentToday, needToday });
    }
  } catch (error) {
    console.error("Error in /today GET endpoint:", error);
    console.error("Stack trace:", error.stack);
    try {
      const currentUser = getUser();
      console.error("Current User state:", JSON.stringify(currentUser));
      console.error("Current Today state keys:", Object.keys(getToday()));
    } catch (e) {
      console.error("Error logging state:", e);
    }
    res.status(500).json({ error: "Internal server error", details: error.message, stack: error.stack });
  }
});

// Route to update today's data
router.post("/today", (req, res) => {
  try {
    const { foodName, servings } = req.body;

    // Get current data from JSON storage
    const foodLibrary = getFoodLibrary();
    const currentToday = getToday();
    const currentUser = getUser();

    if (!foodName || !servings || !foodLibrary[foodName]) {
      return res.status(400).json({ error: "Invalid food name or servings" });
    }

    // Calculate nutrients for the added food
    const foodData = foodLibrary[foodName];
    const nutrients = foodData.Nutrients;

    // Update today's data
    const updatedToday = { ...currentToday };

    // Ensure nutrients object exists
    if (!updatedToday.nutrients) {
      updatedToday.nutrients = {};
    }

    // Update calories
    if (!updatedToday.calories) updatedToday.calories = 0;
    updatedToday.calories += foodData.Metadata.Calories_kcal * servings;

    // Update nutrients
    Object.keys(nutrients).forEach((nutrient) => {
      if (typeof nutrients[nutrient] === "number") {
        if (!updatedToday.nutrients[nutrient]) {
          updatedToday.nutrients[nutrient] = 0;
        }
        updatedToday.nutrients[nutrient] += nutrients[nutrient] * servings;
      }
    });

    // Add food to today's food list
    if (!updatedToday.food) {
      updatedToday.food = {};
    }
    updatedToday.food[foodName] = (updatedToday.food[foodName] || 0) + servings;

    // Save updated data to JSON storage
    setToday(updatedToday);

    // Write updated data to file
    const todayFilePath = path.join(getDataDir(), "today.js");
    const todayFileContent = generateTodayFileContent(updatedToday);

    try {
      fs.writeFileSync(todayFilePath, todayFileContent);
      console.log("💾 [Routes] Saved today.js to:", todayFilePath);
    } catch (writeError) {
      console.error("❌ [Routes] Failed to write today.js:", writeError);
    } // Calculate needToday
    const needToday = createRecommendedMicros(currentUser);
    needToday["Calories_kcal"] = currentUser.calorieGoal;

    res.status(200).json({
      message: `Added ${servings} serving(s) of ${foodName}`,
      updatedToday,
      needToday,
    });
  } catch (error) {
    console.error("Error updating today's data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to reset today's data
router.post("/reset-day", (req, res) => {
  try {
    // Save current data to record before resetting
    saveDailyRecord(today);

    // Create a fresh today object with all values reset to 0
    const resetToday = {
      nutrients: {
        Protein_g: 0,
        Carbohydrates_g: 0,
        Fats_g: 0,
        Omega3_DHA_EPA_mg: 0,
        Vitamin_B12_mcg: 0,
        Choline_mg: 0,
        Magnesium_mg: 0,
        Iron_mg: 0,
        Zinc_mg: 0,
        Calcium_mg: 0,
        Vitamin_D_mcg: 0,
        Vitamin_C_mg: 0,
        Fiber_g: 0,
        Collagen_g: 0,
      },
      calories: 0,
      food: {},
    };

    // Update the IN-MEMORY today object
    today = resetToday;

    // Write reset data to file
    const todayFilePath = path.join(getDataDir(), "today.js");
    const todayFileContent = generateTodayFileContent(resetToday);
    fs.writeFileSync(todayFilePath, todayFileContent);
    console.log("💾 [Routes] Saved today.js (reset) to:", todayFilePath);

    // Also update the lastReset.js file
    const lastResetFilePath = path.join(getDataDir(), "lastReset.js");
    const newLastResetData = {
      lastResetDate: new Date().toDateString(),
    };
    const lastResetFileContent = `// File to track the last reset date for automatic daily resets
const lastResetData = ${JSON.stringify(newLastResetData, null, 2)};

export default lastResetData;`;
    fs.writeFileSync(lastResetFilePath, lastResetFileContent);
    console.log("💾 [Routes] Saved lastReset.js to:", lastResetFilePath);

    // Update lastResetData in memory
    lastResetData.lastResetDate = newLastResetData.lastResetDate;

    // Clear the deleted foods library
    Object.keys(foodDeletedLibrary).forEach(key => delete foodDeletedLibrary[key]);
    const deletedLibraryFilePath = path.join(getDataDir(), "foodDeletedLibrary.js");
    const deletedLibraryFileContent = `// Temporary storage for deleted foods (cleared daily)
// This allows users to remove deleted foods from today's intake
const foodDeletedLibrary = {};

export default foodDeletedLibrary;`;
    fs.writeFileSync(deletedLibraryFilePath, deletedLibraryFileContent);

    // Set the session flag
    resetPerformedToday = true;

    res.status(200).json({
      message: "Day reset successfully",
      resetToday,
    });
  } catch (error) {
    console.error("Error resetting day:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to get daily records
router.get("/records", async (req, res) => {
  try {
    // Get current data from JSON storage
    const currentToday = getToday();
    const allRecords = getRecords();

    // Create a copy of the records array
    const recordsWithToday = [...(allRecords.records || [])];

    // Get today's date in YYYY-MM-DD format (using local time)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayDate = `${year}-${month}-${day}`;

    // Create today's record entry
    const todayRecord = {
      date: todayDate,
      nutrients: currentToday.nutrients || {},
      calories: currentToday.calories || 0,
      food: currentToday.food || {},
      timestamp: new Date().toISOString(),
      isToday: true // Flag to identify this as today's data
    };

    // Check if there's already a record for today in the history
    const existingTodayIndex = recordsWithToday.findIndex(r => r.date === todayDate);

    if (existingTodayIndex !== -1) {
      // Replace existing today's record with current data
      recordsWithToday[existingTodayIndex] = todayRecord;
    } else {
      // Add today's record
      recordsWithToday.push(todayRecord);
    }

    res.status(200).json({ records: recordsWithToday });
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to get user data
router.get("/user", (req, res) => {
  try {
    const currentUser = getUser();
    res.status(200).json(currentUser);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to get today's recommendations
router.get("/recommendations", async (req, res) => {
  try {
    // Dynamically import current user data to get fresh values
    const userModule = await import(getDataFileUrl("user.js"));
    const currentUser = userModule.default;
    const dynamicRecommendations = createRecommendedMicros(currentUser);
    dynamicRecommendations["Calories_kcal"] = currentUser.calorieGoal;

    res.status(200).json(dynamicRecommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to update user data
router.post("/user", (req, res) => {
  try {
    const { name, age, gender, height, weight, activityLevel, calorieGoal } =
      req.body;

    // Validate required fields
    if (
      !name ||
      !age ||
      !gender ||
      !height ||
      !weight ||
      !activityLevel ||
      !calorieGoal
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate numeric fields
    if (age < 1 || age > 120) {
      return res.status(400).json({ error: "Age must be between 1 and 120" });
    }
    if (height < 50 || height > 300) {
      return res
        .status(400)
        .json({ error: "Height must be between 50 and 300 cm" });
    }
    if (weight < 20 || weight > 500) {
      return res
        .status(400)
        .json({ error: "Weight must be between 20 and 500 kg" });
    }
    if (calorieGoal < 1000 || calorieGoal > 10000) {
      return res
        .status(400)
        .json({ error: "Calorie goal must be between 1000 and 10000" });
    }

    // Validate gender
    const validGenders = ["male", "female", "other"];
    if (!validGenders.includes(gender)) {
      return res.status(400).json({ error: "Invalid gender value" });
    }

    // Validate activity level
    const validActivityLevels = [
      "sedentary",
      "light",
      "moderate",
      "active",
      "very active",
    ];
    if (!validActivityLevels.includes(activityLevel)) {
      return res.status(400).json({ error: "Invalid activity level" });
    }

    // Create updated user object
    const updatedUser = {
      name,
      age: Number(age),
      gender,
      height: Number(height),
      weight: Number(weight),
      activityLevel,
      calorieGoal: Number(calorieGoal),
    };

    // Write updated data to file
    const userFilePath = path.join(getDataDir(), "user.js");
    const userFileContent = `const user = ${JSON.stringify(
      updatedUser,
      null,
      4
    )}\n\nexport default user;\n`;

    fs.writeFileSync(userFilePath, userFileContent);

    // Calculate updated recommendations immediately
    const dynamicRecommendations = createRecommendedMicros(updatedUser);
    dynamicRecommendations["Calories_kcal"] = updatedUser.calorieGoal;

    console.log("User data updated successfully");

    res.status(200).json({
      message: "User data updated successfully",
      user: updatedUser,
      recommendations: dynamicRecommendations,
    });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to get meal recommendations based on nutrient gaps
router.get("/smart-recommendations", async (req, res) => {
  try {
    // Dynamically import fresh data
    const userModule = await import("../data/user.js");
    const currentUser = userModule.default;
    const todayModule = await import("../data/today.js");
    const { today: currentToday, needToday } = todayModule.default;

    // Calculate nutrient deficits (what's missing)
    const nutrientDeficits = [];
    let totalCaloriesConsumed = currentToday.calories || 0;
    let remainingCalories = Math.max(0, currentUser.calorieGoal - totalCaloriesConsumed);

    // Get consumed nutrients from the nutrients object
    const consumedNutrients = currentToday.nutrients || {};

    for (const [nutrient, target] of Object.entries(needToday)) {
      const consumed = consumedNutrients[nutrient] || 0;
      const deficit = target - consumed;
      const percentMet = target > 0 ? (consumed / target) * 100 : 100;

      // Only consider deficits where less than 90% of the need is met
      if (deficit > 0 && percentMet < 90) {
        nutrientDeficits.push({
          nutrient,
          deficit,
          percentMet
        });
      }
    }

    // Sort by lowest percentage met (biggest gaps first)
    nutrientDeficits.sort((a, b) => a.percentMet - b.percentMet);

    // Rank foods by how well they fill the nutrient gaps
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
            // First deficit gets 3x weight, second gets 2.5x, gradually decreasing
            const priorityWeight = Math.max(1, 3 - (i * 0.15));
            const weightedScore = percentOfDeficit * priorityWeight;

            score += weightedScore;
            nutrientsProvided.push({
              nutrient: nutrientKey,
              amount: foodNutrientValue,
              percentOfDeficit: Math.round(percentOfDeficit),
              percentOfDailyNeed: Math.round(percentOfDailyNeed)
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
          category: metadata.Category || '',
          nutrientsProvided: nutrientsProvided.sort((a, b) => b.percentOfDeficit - a.percentOfDeficit)
        });
      }
    }

    // Sort by score (best matches first)
    foodScores.sort((a, b) => b.score - a.score);

    // Format top 15 recommendations (to have enough for category filtering)
    const recommendations = foodScores.slice(0, 15).map(food => {
      // Get top 2 nutrients this food helps with
      const topFills = food.nutrientsProvided.slice(0, 2).map(n => ({
        nutrient: n.nutrient.replace(/_/g, ' ').replace(/\s*(mcg|mg|g|kcal)\s*/gi, '').trim(),
        amount: n.amount,
        percentOfDailyNeed: n.percentOfDailyNeed
      }));

      return {
        foodName: food.foodName,
        calories: food.caloriesPerServing,
        servingSize: food.servingSize,
        category: food.category,
        topFills: topFills
      };
    });

    // Format top 5 nutrient gaps
    const topGaps = nutrientDeficits.slice(0, 5).map(d => ({
      nutrient: d.nutrient.replace(/_/g, ' ').replace(/\s*(mcg|mg|g|kcal)\s*/gi, '').trim(),
      percentMet: Math.round(d.percentMet)
    }));

    res.status(200).json({
      remainingCalories,
      nutrientGaps: topGaps,
      recommendations
    });

  } catch (error) {
    console.error("Error generating recommendations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

console.log("📍 [Routes] All food routes registered");
console.log("📍 [Routes] Routes: GET /foodLibrary, POST /foodLibrary, DELETE /foodLibrary/:name");
console.log("📍 [Routes] Routes: GET /records, POST /records, DELETE /records/:id");
console.log("📍 [Routes] Routes: GET /user, PUT /user");
console.log("📍 [Routes] Routes: GET /reset-day, GET /smart-recommendations");

// Error handling middleware for routes
router.use((err, req, res, next) => {
  console.error("❌ [Routes] Router error:", err.message);
  console.error("Stack:", err.stack);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
    route: req.path
  });
});

export default router;
