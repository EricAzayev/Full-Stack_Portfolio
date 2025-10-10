import express from "express";
import foodLibrary from "../data/foodLibrary.js";
import today from "../data/today.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Middleware to parse JSON
router.use(express.json());

// Route to serve foodLibrary data
router.get("/foodLibrary", (req, res) => {
  res.status(200).json(foodLibrary);
});

// Route to serve today data
router.get("/today", (req, res) => {
  res.status(200).json(today);
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
    Object.keys(nutrients).forEach(nutrient => {
      if (typeof nutrients[nutrient] === 'number') {
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
    const todayFileContent = `const today = ${JSON.stringify(updatedToday, null, 2)};\n\nexport default today;`;
    
    fs.writeFileSync(todayFilePath, todayFileContent);
    
    res.status(200).json({ 
      message: `Added ${servings} serving(s) of ${foodName}`,
      updatedToday 
    });
    
  } catch (error) {
    console.error("Error updating today's data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
