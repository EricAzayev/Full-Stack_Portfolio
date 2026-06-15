import { getDatabase, transaction } from "../database/db.js";
import { getFoodByName } from "./foodDAL.js";

function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getSkippedMetadataKey(date) {
  return `skippedAnalytics:${date}`;
}

/**
 * Daily Records Data Access Layer
 * Handles both "today" (current day) and historical records
 */

/**
 * Get daily record by date
 * @param {string} date Date in YYYY-MM-DD format
 * @returns {Object|null} Daily record object or null
 */
export function getRecordByDate(date) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT 
      id, date, total_calories,
      total_protein_g, total_carbohydrates_g, total_fats_g, total_fiber_g,
      total_omega3_dha_epa_mg, total_vitamin_b12_mcg, total_choline_mg,
      total_magnesium_mg, total_iron_mg, total_zinc_mg, total_calcium_mg,
      total_vitamin_d_mcg, total_vitamin_c_mg, total_collagen_g,
      total_added_sugars_g, total_sodium_mg, total_saturated_fat_g, total_monounsaturated_fat_g
    FROM daily_records
    WHERE date = ?
  `);

  const record = stmt.get(date);
  if (!record) {
    return null;
  }

  return {
    ...record,
    skippedInAnalytics: isRecordSkipped(date),
  };
}

/**
 * Get today's record
 * @returns {Object} Today's record (creates if doesn't exist)
 */
export function getTodayRecord() {
  const today = getLocalDateString();
  let record = getRecordByDate(today);
  
  if (!record) {
    // Create today's record
    record = createDailyRecord(today);
  }
  
  return record;
}

/**
 * Get food items for a daily record
 * @param {number} recordId Daily record ID
 * @returns {Array} Array of food items with details
 */
export function getFoodItemsForRecord(recordId) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT 
      dfi.id, dfi.servings,
      f.id as food_id, f.name as food_name,
      f.category, f.serving_size_g, f.calories_kcal,
      f.protein_g, f.carbohydrates_g, f.fats_g, f.fiber_g,
      f.omega3_dha_epa_mg, f.vitamin_b12_mcg, f.choline_mg,
      f.magnesium_mg, f.iron_mg, f.zinc_mg, f.calcium_mg,
      f.vitamin_d_mcg, f.vitamin_c_mg, f.collagen_g,
      f.added_sugars_g, f.sodium_mg, f.saturated_fat_g, f.monounsaturated_fat_g
    FROM daily_food_items dfi
    JOIN foods f ON dfi.food_id = f.id
    WHERE dfi.daily_record_id = ?
  `);
  
  return stmt.all(recordId);
}

/**
 * Get today's data in legacy format (for compatibility)
 * @returns {Object} Today's data in the old format
 */
export function getTodayLegacyFormat() {
  const today = getTodayRecord();
  const foodItems = getFoodItemsForRecord(today.id);
  
  // Build food object (food name -> servings)
  const food = {};
  for (const item of foodItems) {
    food[item.food_name] = item.servings;
  }
  
  return {
    nutrients: {
      Protein_g: today.total_protein_g,
      Carbohydrates_g: today.total_carbohydrates_g,
      Fats_g: today.total_fats_g,
      Omega3_DHA_EPA_mg: today.total_omega3_dha_epa_mg,
      Vitamin_B12_mcg: today.total_vitamin_b12_mcg,
      Choline_mg: today.total_choline_mg,
      Magnesium_mg: today.total_magnesium_mg,
      Iron_mg: today.total_iron_mg,
      Zinc_mg: today.total_zinc_mg,
      Calcium_mg: today.total_calcium_mg,
      Vitamin_D_mcg: today.total_vitamin_d_mcg,
      Vitamin_C_mg: today.total_vitamin_c_mg,
      Fiber_g: today.total_fiber_g,
      Collagen_g: today.total_collagen_g,
      Added_Sugars_g: today.total_added_sugars_g,
      Sodium_mg: today.total_sodium_mg,
      Saturated_Fat_g: today.total_saturated_fat_g,
      Monounsaturated_Fat_g: today.total_monounsaturated_fat_g,
    },
    calories: today.total_calories,
    food: food,
  };
}

/**
 * Create a new daily record
 * @param {string} date Date in YYYY-MM-DD format
 * @returns {Object} The created record
 */
export function createDailyRecord(date) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO daily_records (date, total_calories)
    VALUES (?, 0)
  `);
  
  const result = stmt.run(date);
  return getRecordByDate(date);
}

/**
 * Add or update food servings for today
 * @param {string} foodName Food name
 * @param {number} servings Number of servings (can be negative to subtract)
 * @returns {Object} Updated today's record
 */
export function updateTodayFood(foodName, servings) {
  return transaction(() => {
    const db = getDatabase();
    const today = getTodayRecord();
    const food = getFoodByName(foodName);
    
    if (!food) {
      throw new Error(`Food "${foodName}" not found in library`);
    }
    
    // Check if this food is already in today's items
    const existingStmt = db.prepare(`
      SELECT id, servings
      FROM daily_food_items
      WHERE daily_record_id = ? AND food_id = ?
    `);
    const existing = existingStmt.get(today.id, food.id);
    
    let finalServings = servings;
    
    if (existing) {
      // Update existing item
      finalServings = existing.servings + servings;
      
      if (finalServings <= 0) {
        // Remove item if servings go to 0 or below
        const deleteStmt = db.prepare(`
          DELETE FROM daily_food_items
          WHERE id = ?
        `);
        deleteStmt.run(existing.id);
        finalServings = 0;
      } else {
        // Update servings
        const updateStmt = db.prepare(`
          UPDATE daily_food_items
          SET servings = ?
          WHERE id = ?
        `);
        updateStmt.run(finalServings, existing.id);
      }
    } else if (servings > 0) {
      // Add new item
      const insertStmt = db.prepare(`
        INSERT INTO daily_food_items (daily_record_id, food_id, servings)
        VALUES (?, ?, ?)
      `);
      insertStmt.run(today.id, food.id, servings);
    }
    
    // Calculate nutrient changes
    const nutrientChange = servings;
    
    // Update daily totals
    const updateTotalsStmt = db.prepare(`
      UPDATE daily_records SET
        total_calories = total_calories + (? * ?),
        total_protein_g = total_protein_g + (? * ?),
        total_carbohydrates_g = total_carbohydrates_g + (? * ?),
        total_fats_g = total_fats_g + (? * ?),
        total_fiber_g = total_fiber_g + (? * ?),
        total_omega3_dha_epa_mg = total_omega3_dha_epa_mg + (? * ?),
        total_vitamin_b12_mcg = total_vitamin_b12_mcg + (? * ?),
        total_choline_mg = total_choline_mg + (? * ?),
        total_magnesium_mg = total_magnesium_mg + (? * ?),
        total_iron_mg = total_iron_mg + (? * ?),
        total_zinc_mg = total_zinc_mg + (? * ?),
        total_calcium_mg = total_calcium_mg + (? * ?),
        total_vitamin_d_mcg = total_vitamin_d_mcg + (? * ?),
        total_vitamin_c_mg = total_vitamin_c_mg + (? * ?),
        total_collagen_g = total_collagen_g + (? * ?),
        total_added_sugars_g = total_added_sugars_g + (? * ?),
        total_sodium_mg = total_sodium_mg + (? * ?),
        total_saturated_fat_g = total_saturated_fat_g + (? * ?),
        total_monounsaturated_fat_g = total_monounsaturated_fat_g + (? * ?)
      WHERE id = ?
    `);
    
    updateTotalsStmt.run(
      nutrientChange, food.calories,
      nutrientChange, food.protein_g,
      nutrientChange, food.carbohydrates_g,
      nutrientChange, food.fats_g,
      nutrientChange, food.fiber_g,
      nutrientChange, food.omega3_dha_epa_mg,
      nutrientChange, food.vitamin_b12_mcg,
      nutrientChange, food.choline_mg,
      nutrientChange, food.magnesium_mg,
      nutrientChange, food.iron_mg,
      nutrientChange, food.zinc_mg,
      nutrientChange, food.calcium_mg,
      nutrientChange, food.vitamin_d_mcg,
      nutrientChange, food.vitamin_c_mg,
      nutrientChange, food.collagen_g,
      nutrientChange, food.added_sugars_g,
      nutrientChange, food.sodium_mg,
      nutrientChange, food.saturated_fat_g,
      nutrientChange, food.monounsaturated_fat_g,
      today.id
    );
    
    return getRecordByDate(today.date);
  });
}

/**
 * Reset today's record (clear all foods and nutrients)
 * @returns {Object} The reset record
 */
export function resetTodayRecord() {
  return transaction(() => {
    const db = getDatabase();
    const today = getTodayRecord();
    
    // Delete all food items for today
    const deleteFoodsStmt = db.prepare(`
      DELETE FROM daily_food_items
      WHERE daily_record_id = ?
    `);
    deleteFoodsStmt.run(today.id);
    
    // Reset all totals to 0
    const resetTotalsStmt = db.prepare(`
      UPDATE daily_records SET
        total_calories = 0,
        total_protein_g = 0,
        total_carbohydrates_g = 0,
        total_fats_g = 0,
        total_fiber_g = 0,
        total_omega3_dha_epa_mg = 0,
        total_vitamin_b12_mcg = 0,
        total_choline_mg = 0,
        total_magnesium_mg = 0,
        total_iron_mg = 0,
        total_zinc_mg = 0,
        total_calcium_mg = 0,
        total_vitamin_d_mcg = 0,
        total_vitamin_c_mg = 0,
        total_collagen_g = 0,
        total_added_sugars_g = 0,
        total_sodium_mg = 0,
        total_saturated_fat_g = 0,
        total_monounsaturated_fat_g = 0
      WHERE id = ?
    `);
    resetTotalsStmt.run(today.id);
    
    return getRecordByDate(today.date);
  });
}

/**
 * Get all historical records
 * @param {number} limit Number of records to return (default: all)
 * @param {number} offset Offset for pagination (default: 0)
 * @returns {Array} Array of daily records
 */
export function getAllRecords(limit = null, offset = 0) {
  const db = getDatabase();
  
  let query = `
    SELECT 
      id, date, total_calories,
      total_protein_g, total_carbohydrates_g, total_fats_g, total_fiber_g,
      total_omega3_dha_epa_mg, total_vitamin_b12_mcg, total_choline_mg,
      total_magnesium_mg, total_iron_mg, total_zinc_mg, total_calcium_mg,
      total_vitamin_d_mcg, total_vitamin_c_mg, total_collagen_g,
      total_added_sugars_g, total_sodium_mg, total_saturated_fat_g, total_monounsaturated_fat_g,
      created_at as timestamp
    FROM daily_records
    ORDER BY date DESC
  `;
  
  if (limit) {
    query += ` LIMIT ${limit} OFFSET ${offset}`;
  }
  
  const stmt = db.prepare(query);
  return stmt.all().map((record) => ({
    ...record,
    skippedInAnalytics: isRecordSkipped(record.date),
  }));
}

/**
 * Get all records in legacy format (for compatibility)
 * @returns {Object} Records object with records array
 */
export function getAllRecordsLegacyFormat() {
  const records = getAllRecords();
  const legacyRecords = [];
  
  for (const record of records) {
    const foodItems = getFoodItemsForRecord(record.id);
    
    // Build food object
    const food = {};
    for (const item of foodItems) {
      food[item.food_name] = item.servings;
    }
    
    legacyRecords.push({
      date: record.date,
      skippedInAnalytics: Boolean(record.skippedInAnalytics),
      nutrients: {
        Protein_g: record.total_protein_g,
        Carbohydrates_g: record.total_carbohydrates_g,
        Fats_g: record.total_fats_g,
        Omega3_DHA_EPA_mg: record.total_omega3_dha_epa_mg,
        Vitamin_B12_mcg: record.total_vitamin_b12_mcg,
        Choline_mg: record.total_choline_mg,
        Magnesium_mg: record.total_magnesium_mg,
        Iron_mg: record.total_iron_mg,
        Zinc_mg: record.total_zinc_mg,
        Calcium_mg: record.total_calcium_mg,
        Vitamin_D_mcg: record.total_vitamin_d_mcg,
        Vitamin_C_mg: record.total_vitamin_c_mg,
        Fiber_g: record.total_fiber_g,
        Collagen_g: record.total_collagen_g,
        Added_Sugars_g: record.total_added_sugars_g,
        Sodium_mg: record.total_sodium_mg,
        Saturated_Fat_g: record.total_saturated_fat_g,
        Monounsaturated_Fat_g: record.total_monounsaturated_fat_g,
      },
      calories: record.total_calories,
      food: food,
      timestamp: record.timestamp,
    });
  }
  
  return { records: legacyRecords };
}

export function isRecordSkipped(date) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT value
    FROM system_metadata
    WHERE key = ?
  `);

  const result = stmt.get(getSkippedMetadataKey(date));
  return result ? result.value === "true" : false;
}

export function setRecordSkipped(date, skipped) {
  const db = getDatabase();
  const record = getRecordByDate(date);

  if (!record) {
    throw new Error(`Record for ${date} not found`);
  }

  if (skipped) {
    const stmt = db.prepare(`
      INSERT INTO system_metadata (key, value)
      VALUES (?, 'true')
      ON CONFLICT(key) DO UPDATE SET
        value = 'true',
        updated_at = datetime('now')
    `);
    stmt.run(getSkippedMetadataKey(date));
  } else {
    const stmt = db.prepare(`
      DELETE FROM system_metadata
      WHERE key = ?
    `);
    stmt.run(getSkippedMetadataKey(date));
  }

  return getRecordByDate(date);
}

/**
 * Get last reset date from system metadata
 * @returns {string} Last reset date
 */
export function getLastResetDate() {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT value
    FROM system_metadata
    WHERE key = 'lastResetDate'
  `);
  
  const result = stmt.get();
  return result ? result.value : new Date().toDateString();
}

/**
 * Update last reset date
 * @param {string} date Date string
 */
export function updateLastResetDate(date) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO system_metadata (key, value)
    VALUES ('lastResetDate', ?)
    ON CONFLICT(key) DO UPDATE SET
      value = ?,
      updated_at = datetime('now')
  `);
  
  stmt.run(date, date);
}

export default {
  getRecordByDate,
  getTodayRecord,
  getTodayLegacyFormat,
  getFoodItemsForRecord,
  createDailyRecord,
  updateTodayFood,
  resetTodayRecord,
  getAllRecords,
  getAllRecordsLegacyFormat,
  isRecordSkipped,
  getLastResetDate,
  setRecordSkipped,
  updateLastResetDate,
};
