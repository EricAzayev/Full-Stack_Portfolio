import express from "express";
import foodLibrary from "../data/foodLibrary.js";
import todayData from "../data/today.js";
import { createRecommendedMicros } from "../data/nutrientCalculator.js";
const { today, needToday } = todayData;
import lastResetData from "../data/lastReset.js";
import record from "../data/record.js";
import user from "../data/user.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

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
    const foodLibraryFilePath = path.join(__dirname, "../data/foodLibrary.js");
    const foodLibraryFileContent = `const foodLibrary = ${JSON.stringify(foodLibrary, null, 2)}

export default foodLibrary;`;

    fs.writeFileSync(foodLibraryFilePath, foodLibraryFileContent);

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
    const foodLibraryFilePath = path.join(__dirname, "../data/foodLibrary.js");
    const foodLibraryFileContent = `const foodLibrary = ${JSON.stringify(foodLibrary, null, 2)}

export default foodLibrary;`;

    fs.writeFileSync(foodLibraryFilePath, foodLibraryFileContent);

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

    // Remove the food from the library
    delete foodLibrary[foodName];

    // Write updated food library to file
    const foodLibraryFilePath = path.join(__dirname, "../data/foodLibrary.js");
    const foodLibraryFileContent = `const foodLibrary = ${JSON.stringify(foodLibrary, null, 2)}

export default foodLibrary;`;

    fs.writeFileSync(foodLibraryFilePath, foodLibraryFileContent);

    console.log(`Food "${foodName}" deleted from food library`);

    res.status(200).json({
      message: `Food "${foodName}" deleted successfully`,
      foodLibrary: foodLibrary
    });
  } catch (error) {
    console.error("Error deleting food from library:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Function to check if we need to reset for a new day
const shouldResetForNewDay = () => {
  const today = new Date();
  const todayString = today.toDateString();

  // If no last reset date or it's a different day, we need to reset
  return lastResetData.lastResetDate !== todayString;
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
  food: {},
});

// Function to save today's data to record before resetting
const saveDailyRecord = (todayData) => {
  try {
    const today = new Date();
    const dateString = today.toISOString().split("T")[0]; // YYYY-MM-DD format

    // Create the daily record entry
    const dailyRecord = {
      date: dateString,
      nutrients: todayData.nutrients,
      calories: todayData.calories,
      food: todayData.food,
      timestamp: today.toISOString(),
    };

    // Get existing records
    const existingRecords = record.records || [];

    // Check if record for today already exists and update it, otherwise add new
    const existingIndex = existingRecords.findIndex(
      (r) => r.date === dateString
    );
    if (existingIndex >= 0) {
      existingRecords[existingIndex] = dailyRecord;
    } else {
      existingRecords.push(dailyRecord);
    }

    // Sort records by date (newest first)
    existingRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Update the record.js file
    const recordFilePath = path.join(__dirname, "../data/record.js");
    const recordFileContent = `// Daily food intake records
const record = {
  records: ${JSON.stringify(existingRecords, null, 2)}
};

export default record;`;

    fs.writeFileSync(recordFilePath, recordFileContent);

    console.log(`Daily record saved for ${dateString}`);
  } catch (error) {
    console.error("Error saving daily record:", error);
  }
};

// Route to serve today data with automatic daily reset
router.get("/today", (req, res) => {
  try {
    let todayData = today;

    // Check if we need to reset for a new day
    if (shouldResetForNewDay()) {
      console.log("New day detected, saving record and resetting data...");

      // Save today's data to record before resetting
      saveDailyRecord(today);

      // Create fresh today data
      const freshToday = createFreshToday();

      // Update the today.js file with fresh data
      const todayFilePath = path.join(__dirname, "../data/today.js");
      const todayFileContent = generateTodayFileContent(freshToday);

      fs.writeFileSync(todayFilePath, todayFileContent);

      // Update the lastReset.js file
      const lastResetFilePath = path.join(__dirname, "../data/lastReset.js");
      const newLastResetData = {
        lastResetDate: new Date().toDateString(),
      };
      const lastResetFileContent = `// File to track the last reset date for automatic daily resets
const lastResetData = ${JSON.stringify(newLastResetData, null, 2)};

export default lastResetData;`;
      fs.writeFileSync(lastResetFilePath, lastResetFileContent);

      // Use the fresh data for the response
      todayData = freshToday;
    }

    res.status(200).json({ today: todayData, needToday });
  } catch (error) {
    console.error("Error in /today GET endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to update today's data
router.post("/today", (req, res) => {
  try {
    const { foodName, servings } = req.body;

    if (!foodName || !servings || !foodLibrary[foodName]) {
      return res.status(400).json({ error: "Invalid food name or servings" });
    }

    // Calculate nutrients for the added food
    const foodData = foodLibrary[foodName];
    const nutrients = foodData.Nutrients;

    // Update today's data
    const updatedToday = { ...today };

    // Update calories
    updatedToday.calories += foodData.Metadata.Calories_kcal * servings;

    // Update nutrients
    Object.keys(nutrients).forEach((nutrient) => {
      if (typeof nutrients[nutrient] === "number") {
        updatedToday.nutrients[nutrient] += nutrients[nutrient] * servings;
      }
    });

    // Add food to today's food list
    if (!updatedToday.food) {
      updatedToday.food = {};
    }
    updatedToday.food[foodName] = (updatedToday.food[foodName] || 0) + servings;

    // Write updated data to file
    const todayFilePath = path.join(__dirname, "../data/today.js");
    const todayFileContent = generateTodayFileContent(updatedToday);

    fs.writeFileSync(todayFilePath, todayFileContent);

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

    // Write reset data to file
    const todayFilePath = path.join(__dirname, "../data/today.js");
    const todayFileContent = generateTodayFileContent(resetToday);

    fs.writeFileSync(todayFilePath, todayFileContent);

    // Also update the lastReset.js file
    const lastResetFilePath = path.join(__dirname, "../data/lastReset.js");
    const newLastResetData = {
      lastResetDate: new Date().toDateString(),
    };
    const lastResetFileContent = `// File to track the last reset date for automatic daily resets
const lastResetData = ${JSON.stringify(newLastResetData, null, 2)};

export default lastResetData;`;
    fs.writeFileSync(lastResetFilePath, lastResetFileContent);

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
router.get("/records", (req, res) => {
  try {
    res.status(200).json(record);
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to get user data
router.get("/user", (req, res) => {
  try {
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to get today's recommendations
router.get("/recommendations", async (req, res) => {
  try {
    // Dynamically import current user data to get fresh values
    const userModule = await import("../data/user.js");
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
    const userFilePath = path.join(__dirname, "../data/user.js");
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

export default router;
