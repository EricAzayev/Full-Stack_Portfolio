import { initDatabase, getDatabase, transaction } from "./database/db.js";
import { saveUser } from "./dal/userDAL.js";
import { addFood } from "./dal/foodDAL.js";
import { createDailyRecord, updateLastResetDate } from "./dal/recordDAL.js";
import { getDataFileUrl } from "./utils/pathUtils.js";

/**
 * Migration script to move data from .js files to SQLite database
 */

console.log("🔄 [Migration] Starting data migration...");

// Initialize database
initDatabase();

/**
 * Import legacy data files with error handling
 */
async function importLegacyData() {
  let user, foodLibrary, todayData, record, lastResetData;
  
  try {
    user = (await import(getDataFileUrl("user.js"))).default;
    console.log("✅ [Migration] Imported user.js");
  } catch (e) {
    console.warn("⚠️ [Migration] Could not import user.js:", e.message);
    user = null;
  }
  
  try {
    foodLibrary = (await import(getDataFileUrl("foodLibrary.js"))).default;
    console.log("✅ [Migration] Imported foodLibrary.js");
  } catch (e) {
    console.warn("⚠️ [Migration] Could not import foodLibrary.js:", e.message);
    foodLibrary = {};
  }
  
  try {
    todayData = (await import(getDataFileUrl("today.js"))).default;
    console.log("✅ [Migration] Imported today.js");
  } catch (e) {
    console.warn("⚠️ [Migration] Could not import today.js:", e.message);
    todayData = null;
  }
  
  try {
    record = (await import(getDataFileUrl("record.js"))).default;
    console.log("✅ [Migration] Imported record.js");
  } catch (e) {
    console.warn("⚠️ [Migration] Could not import record.js:", e.message);
    record = { records: [] };
  }
  
  try {
    lastResetData = (await import(getDataFileUrl("lastReset.js"))).default;
    console.log("✅ [Migration] Imported lastReset.js");
  } catch (e) {
    console.warn("⚠️ [Migration] Could not import lastReset.js:", e.message);
    lastResetData = { lastResetDate: new Date().toDateString() };
  }
  
  return { user, foodLibrary, todayData, record, lastResetData };
}

/**
 * Migrate user profile
 */
function migrateUser(user) {
  if (!user) {
    console.log("⚠️ [Migration] No user data to migrate");
    return;
  }
  
  console.log("🔄 [Migration] Migrating user profile...");
  saveUser(user);
  console.log("✅ [Migration] User profile migrated:", user.name);
}

/**
 * Migrate food library
 */
function migrateFoodLibrary(foodLibrary) {
  if (!foodLibrary || Object.keys(foodLibrary).length === 0) {
    console.log("⚠️ [Migration] No food library data to migrate");
    return;
  }
  
  console.log("🔄 [Migration] Migrating food library...");
  let count = 0;
  
  for (const [foodName, foodData] of Object.entries(foodLibrary)) {
    try {
      const food = {
        name: foodName,
        category: foodData.Metadata.Category,
        servingSize: foodData.Metadata.ServingSize_g,
        calories: foodData.Metadata.Calories_kcal,
        isProbiotic: foodData.Metadata.IsProbiotic ? 1 : 0,
        protein_g: foodData.Nutrients.Protein_g,
        carbohydrates_g: foodData.Nutrients.Carbohydrates_g,
        fats_g: foodData.Nutrients.Fats_g,
        fiber_g: foodData.Nutrients.Fiber_g,
        omega3_dha_epa_mg: foodData.Nutrients.Omega3_DHA_EPA_mg,
        vitamin_b12_mcg: foodData.Nutrients.Vitamin_B12_mcg,
        choline_mg: foodData.Nutrients.Choline_mg,
        magnesium_mg: foodData.Nutrients.Magnesium_mg,
        iron_mg: foodData.Nutrients.Iron_mg,
        zinc_mg: foodData.Nutrients.Zinc_mg,
        calcium_mg: foodData.Nutrients.Calcium_mg,
        vitamin_d_mcg: foodData.Nutrients.Vitamin_D_mcg,
        vitamin_c_mg: foodData.Nutrients.Vitamin_C_mg,
        collagen_g: foodData.Nutrients.Collagen_g,
      };
      
      addFood(food);
      count++;
    } catch (e) {
      console.error(`❌ [Migration] Failed to migrate food "${foodName}":`, e.message);
    }
  }
  
  console.log(`✅ [Migration] Migrated ${count} foods`);
}

/**
 * Migrate today's data
 */
function migrateTodayData(todayData, foodLibrary) {
  if (!todayData || !todayData.today) {
    console.log("⚠️ [Migration] No today data to migrate");
    return;
  }
  
  console.log("🔄 [Migration] Migrating today's data...");
  
  const db = getDatabase();
  const today = new Date().toISOString().split("T")[0];
  
  transaction(() => {
    // Create today's record
    const recordStmt = db.prepare(`
      INSERT INTO daily_records (
        date, total_calories,
        total_protein_g, total_carbohydrates_g, total_fats_g, total_fiber_g,
        total_omega3_dha_epa_mg, total_vitamin_b12_mcg, total_choline_mg,
        total_magnesium_mg, total_iron_mg, total_zinc_mg, total_calcium_mg,
        total_vitamin_d_mcg, total_vitamin_c_mg, total_collagen_g
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const recordResult = recordStmt.run(
      today,
      todayData.today.calories || 0,
      todayData.today.nutrients.Protein_g || 0,
      todayData.today.nutrients.Carbohydrates_g || 0,
      todayData.today.nutrients.Fats_g || 0,
      todayData.today.nutrients.Fiber_g || 0,
      todayData.today.nutrients.Omega3_DHA_EPA_mg || 0,
      todayData.today.nutrients.Vitamin_B12_mcg || 0,
      todayData.today.nutrients.Choline_mg || 0,
      todayData.today.nutrients.Magnesium_mg || 0,
      todayData.today.nutrients.Iron_mg || 0,
      todayData.today.nutrients.Zinc_mg || 0,
      todayData.today.nutrients.Calcium_mg || 0,
      todayData.today.nutrients.Vitamin_D_mcg || 0,
      todayData.today.nutrients.Vitamin_C_mg || 0,
      todayData.today.nutrients.Collagen_g || 0
    );
    
    const recordId = recordResult.lastInsertRowid;
    
    // Add food items
    if (todayData.today.food) {
      const foodItemStmt = db.prepare(`
        INSERT INTO daily_food_items (daily_record_id, food_id, servings)
        SELECT ?, id, ? FROM foods WHERE name = ?
      `);
      
      for (const [foodName, servings] of Object.entries(todayData.today.food)) {
        try {
          foodItemStmt.run(recordId, servings, foodName);
        } catch (e) {
          console.warn(`⚠️ [Migration] Could not add food item "${foodName}":`, e.message);
        }
      }
    }
  });
  
  console.log("✅ [Migration] Today's data migrated");
}

/**
 * Migrate historical records
 */
function migrateRecords(record) {
  if (!record || !record.records || record.records.length === 0) {
    console.log("⚠️ [Migration] No historical records to migrate");
    return;
  }
  
  console.log("🔄 [Migration] Migrating historical records...");
  
  const db = getDatabase();
  let count = 0;
  
  for (const dailyRecord of record.records) {
    try {
      transaction(() => {
        // Create record
        const recordStmt = db.prepare(`
          INSERT INTO daily_records (
            date, total_calories,
            total_protein_g, total_carbohydrates_g, total_fats_g, total_fiber_g,
            total_omega3_dha_epa_mg, total_vitamin_b12_mcg, total_choline_mg,
            total_magnesium_mg, total_iron_mg, total_zinc_mg, total_calcium_mg,
            total_vitamin_d_mcg, total_vitamin_c_mg, total_collagen_g,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const recordResult = recordStmt.run(
          dailyRecord.date,
          dailyRecord.calories || 0,
          dailyRecord.nutrients.Protein_g || 0,
          dailyRecord.nutrients.Carbohydrates_g || 0,
          dailyRecord.nutrients.Fats_g || 0,
          dailyRecord.nutrients.Fiber_g || 0,
          dailyRecord.nutrients.Omega3_DHA_EPA_mg || 0,
          dailyRecord.nutrients.Vitamin_B12_mcg || 0,
          dailyRecord.nutrients.Choline_mg || 0,
          dailyRecord.nutrients.Magnesium_mg || 0,
          dailyRecord.nutrients.Iron_mg || 0,
          dailyRecord.nutrients.Zinc_mg || 0,
          dailyRecord.nutrients.Calcium_mg || 0,
          dailyRecord.nutrients.Vitamin_D_mcg || 0,
          dailyRecord.nutrients.Vitamin_C_mg || 0,
          dailyRecord.nutrients.Collagen_g || 0,
          dailyRecord.timestamp || new Date().toISOString()
        );
        
        const recordId = recordResult.lastInsertRowid;
        
        // Add food items
        if (dailyRecord.food) {
          const foodItemStmt = db.prepare(`
            INSERT INTO daily_food_items (daily_record_id, food_id, servings)
            SELECT ?, id, ? FROM foods WHERE name = ?
          `);
          
          for (const [foodName, servings] of Object.entries(dailyRecord.food)) {
            try {
              foodItemStmt.run(recordId, servings, foodName);
            } catch (e) {
              console.warn(`⚠️ [Migration] Could not add food item "${foodName}" for ${dailyRecord.date}:`, e.message);
            }
          }
        }
        
        count++;
      });
    } catch (e) {
      console.error(`❌ [Migration] Failed to migrate record for ${dailyRecord.date}:`, e.message);
    }
  }
  
  console.log(`✅ [Migration] Migrated ${count} historical records`);
}

/**
 * Migrate last reset date
 */
function migrateLastResetDate(lastResetData) {
  if (!lastResetData || !lastResetData.lastResetDate) {
    console.log("⚠️ [Migration] No last reset date to migrate");
    return;
  }
  
  console.log("🔄 [Migration] Migrating last reset date...");
  updateLastResetDate(lastResetData.lastResetDate);
  console.log("✅ [Migration] Last reset date migrated:", lastResetData.lastResetDate);
}

/**
 * Main migration function
 */
async function runMigration() {
  try {
    console.log("🔄 [Migration] Importing legacy data files...");
    const { user, foodLibrary, todayData, record, lastResetData } = await importLegacyData();
    
    console.log("🔄 [Migration] Starting database migration...");
    
    // Check if database already has data
    const db = getDatabase();
    const foodCountStmt = db.prepare("SELECT COUNT(*) as count FROM foods");
    const foodCount = foodCountStmt.get();
    
    if (foodCount.count > 0) {
      console.log("⚠️ [Migration] Database already contains data. Skipping migration.");
      console.log("⚠️ [Migration] To re-run migration, delete foodtracker.db and restart.");
      return;
    }
    
    // Migrate in order: user -> foods -> records -> today -> metadata
    migrateUser(user);
    migrateFoodLibrary(foodLibrary);
    migrateRecords(record);
    migrateTodayData(todayData, foodLibrary);
    migrateLastResetDate(lastResetData);
    
    console.log("✅ [Migration] Migration completed successfully!");
    console.log("📊 [Migration] Summary:");
    
    const userCountStmt = db.prepare("SELECT COUNT(*) as count FROM user_profile");
    const foodsCountStmt = db.prepare("SELECT COUNT(*) as count FROM foods");
    const recordsCountStmt = db.prepare("SELECT COUNT(*) as count FROM daily_records");
    
    console.log(`   - Users: ${userCountStmt.get().count}`);
    console.log(`   - Foods: ${foodsCountStmt.get().count}`);
    console.log(`   - Records: ${recordsCountStmt.get().count}`);
    
  } catch (error) {
    console.error("❌ [Migration] Migration failed:", error);
    console.error(error.stack);
    throw error;
  }
}

// Run migration
runMigration().catch((error) => {
  console.error("❌ [Migration] Fatal error:", error);
  process.exit(1);
});
