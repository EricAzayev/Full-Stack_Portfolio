import { getDatabase } from "../database/db.js";

/**
 * Food Library Data Access Layer
 */

/**
 * Get all foods from library
 * @returns {Array} Array of food objects
 */
export function getAllFoods() {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT 
      id, name, category, serving_size_g as servingSize, 
      calories_kcal as calories, is_probiotic as isProbiotic,
      protein_g, carbohydrates_g, fats_g, fiber_g,
      omega3_dha_epa_mg, vitamin_b12_mcg, choline_mg,
      magnesium_mg, iron_mg, zinc_mg, calcium_mg,
      vitamin_d_mcg, vitamin_c_mg, collagen_g,
      added_sugars_g, sodium_mg, saturated_fat_g, monounsaturated_fat_g
    FROM foods
    ORDER BY name
  `);
  
  return stmt.all();
}

/**
 * Get a single food by name
 * @param {string} name Food name
 * @returns {Object|null} Food object or null
 */
export function getFoodByName(name) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT 
      id, name, category, serving_size_g as servingSize, 
      calories_kcal as calories, is_probiotic as isProbiotic,
      protein_g, carbohydrates_g, fats_g, fiber_g,
      omega3_dha_epa_mg, vitamin_b12_mcg, choline_mg,
      magnesium_mg, iron_mg, zinc_mg, calcium_mg,
      vitamin_d_mcg, vitamin_c_mg, collagen_g,
      added_sugars_g, sodium_mg, saturated_fat_g, monounsaturated_fat_g
    FROM foods
    WHERE name = ?
  `);
  
  return stmt.get(name);
}

/**
 * Get a single food by ID
 * @param {number} id Food ID
 * @returns {Object|null} Food object or null
 */
export function getFoodById(id) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT 
      id, name, category, serving_size_g as servingSize, 
      calories_kcal as calories, is_probiotic as isProbiotic,
      protein_g, carbohydrates_g, fats_g, fiber_g,
      omega3_dha_epa_mg, vitamin_b12_mcg, choline_mg,
      magnesium_mg, iron_mg, zinc_mg, calcium_mg,
      vitamin_d_mcg, vitamin_c_mg, collagen_g,
      added_sugars_g, sodium_mg, saturated_fat_g, monounsaturated_fat_g
    FROM foods
    WHERE id = ?
  `);
  
  return stmt.get(id);
}

/**
 * Add a new food to the library
 * @param {Object} foodData Food data
 * @returns {Object} The created food
 */
export function addFood(foodData) {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    INSERT INTO foods (
      name, category, serving_size_g, calories_kcal, is_probiotic,
      protein_g, carbohydrates_g, fats_g, fiber_g,
      omega3_dha_epa_mg, vitamin_b12_mcg, choline_mg,
      magnesium_mg, iron_mg, zinc_mg, calcium_mg,
      vitamin_d_mcg, vitamin_c_mg, collagen_g,
      added_sugars_g, sodium_mg, saturated_fat_g, monounsaturated_fat_g
    ) VALUES (
      @name, @category, @servingSize, @calories, @isProbiotic,
      @protein_g, @carbohydrates_g, @fats_g, @fiber_g,
      @omega3_dha_epa_mg, @vitamin_b12_mcg, @choline_mg,
      @magnesium_mg, @iron_mg, @zinc_mg, @calcium_mg,
      @vitamin_d_mcg, @vitamin_c_mg, @collagen_g,
      @added_sugars_g, @sodium_mg, @saturated_fat_g, @monounsaturated_fat_g
    )
  `);
  
  const result = stmt.run(foodData);
  return getFoodById(result.lastInsertRowid);
}

/**
 * Update an existing food
 * @param {string} oldName Current food name
 * @param {Object} foodData Updated food data
 * @returns {Object} The updated food
 */
export function updateFood(oldName, foodData) {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    UPDATE foods SET
      name = @name,
      category = @category,
      serving_size_g = @servingSize,
      calories_kcal = @calories,
      is_probiotic = @isProbiotic,
      protein_g = @protein_g,
      carbohydrates_g = @carbohydrates_g,
      fats_g = @fats_g,
      fiber_g = @fiber_g,
      omega3_dha_epa_mg = @omega3_dha_epa_mg,
      vitamin_b12_mcg = @vitamin_b12_mcg,
      choline_mg = @choline_mg,
      magnesium_mg = @magnesium_mg,
      iron_mg = @iron_mg,
      zinc_mg = @zinc_mg,
      calcium_mg = @calcium_mg,
      vitamin_d_mcg = @vitamin_d_mcg,
      vitamin_c_mg = @vitamin_c_mg,
      collagen_g = @collagen_g,
      added_sugars_g = @added_sugars_g,
      sodium_mg = @sodium_mg,
      saturated_fat_g = @saturated_fat_g,
      monounsaturated_fat_g = @monounsaturated_fat_g
    WHERE name = @oldName
  `);
  
  stmt.run({ ...foodData, oldName });
  return getFoodByName(foodData.name);
}

/**
 * Delete a food from the library
 * @param {string} name Food name
 * @returns {Object} The deleted food data
 */
export function deleteFood(name) {
  const db = getDatabase();
  
  // Get the food data before deletion
  const food = getFoodByName(name);
  if (!food) {
    throw new Error(`Food "${name}" not found`);
  }
  
  // Store in deleted_foods table
  const insertStmt = db.prepare(`
    INSERT INTO deleted_foods (food_name, food_data)
    VALUES (?, ?)
  `);
  insertStmt.run(name, JSON.stringify(food));
  
  // Delete the food
  const deleteStmt = db.prepare("DELETE FROM foods WHERE name = ?");
  deleteStmt.run(name);
  
  return food;
}

/**
 * Get all deleted foods
 * @returns {Object} Object with deleted food names as keys
 */
export function getDeletedFoods() {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT food_name, food_data
    FROM deleted_foods
  `);
  
  const results = stmt.all();
  const deletedFoods = {};
  
  for (const row of results) {
    deletedFoods[row.food_name] = JSON.parse(row.food_data);
  }
  
  return deletedFoods;
}

/**
 * Clear all deleted foods (typically done during daily reset)
 */
export function clearDeletedFoods() {
  const db = getDatabase();
  const stmt = db.prepare("DELETE FROM deleted_foods");
  stmt.run();
}

/**
 * Get food library in legacy format (for compatibility)
 * @returns {Object} Food library as object with food names as keys
 */
export function getFoodLibraryLegacyFormat() {
  const foods = getAllFoods();
  const library = {};
  
  for (const food of foods) {
    library[food.name] = {
      Metadata: {
        Category: food.category,
        ServingSize_g: food.servingSize,
        Calories_kcal: food.calories,
        IsProbiotic: Boolean(food.isProbiotic),
      },
      Nutrients: {
        Protein_g: food.protein_g,
        Carbohydrates_g: food.carbohydrates_g,
        Fats_g: food.fats_g,
        Omega3_DHA_EPA_mg: food.omega3_dha_epa_mg,
        Vitamin_B12_mcg: food.vitamin_b12_mcg,
        Choline_mg: food.choline_mg,
        Magnesium_mg: food.magnesium_mg,
        Iron_mg: food.iron_mg,
        Zinc_mg: food.zinc_mg,
        Calcium_mg: food.calcium_mg,
        Vitamin_D_mcg: food.vitamin_d_mcg,
        Vitamin_C_mg: food.vitamin_c_mg,
        Fiber_g: food.fiber_g,
        Collagen_g: food.collagen_g,
        Added_Sugars_g: food.added_sugars_g,
        Sodium_mg: food.sodium_mg,
        Saturated_Fat_g: food.saturated_fat_g,
        Monounsaturated_Fat_g: food.monounsaturated_fat_g,
      },
      CollagenSupport: {
        DerivedFrom: ["Protein_g"],
        SupportsCollagenSynthesis: true,
      },
      Supports: {
        Brain: [
          "Omega3_DHA_EPA_mg",
          "Vitamin_B12_mcg",
          "Choline_mg",
          "Magnesium_mg",
          "Iron_mg",
        ],
        Muscle: [
          "Protein_g",
          "Vitamin_D_mcg",
          "Magnesium_mg",
          "Iron_mg",
          "Zinc_mg",
          "Calcium_mg",
        ],
        Skin: ["Omega3_DHA_EPA_mg", "CollagenSupport", "Zinc_mg"],
      },
      Synergy: {
        Vitamin_D_mcg: ["Calcium_mg"],
      },
    };
  }
  
  return library;
}

export default {
  getAllFoods,
  getFoodByName,
  getFoodById,
  addFood,
  updateFood,
  deleteFood,
  getDeletedFoods,
  clearDeletedFoods,
  getFoodLibraryLegacyFormat,
};
