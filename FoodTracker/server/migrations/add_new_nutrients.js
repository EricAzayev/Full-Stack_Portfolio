/**
 * Migration: Add new nutrient columns
 * Adds Added_Sugars_g, Sodium_mg, Saturated_Fat_g, Monounsaturated_Fat_g
 * to both foods and daily_records tables
 */

import { getDatabase, initDatabase } from '../database/db.js';

export function up() {
  // Initialize database first
  initDatabase();
  const db = getDatabase();
  
  console.log('📍 Starting migration: Adding new nutrient columns...');
  
  try {
    // Check if columns already exist by trying to select them
    try {
      db.prepare('SELECT added_sugars_g FROM foods LIMIT 1').get();
      console.log('✅ New nutrient columns already exist. Migration not needed.');
      return;
    } catch (e) {
      // Columns don't exist, proceed with migration
    }
    
    // Add new columns to foods table
    db.exec(`
      ALTER TABLE foods ADD COLUMN added_sugars_g REAL NOT NULL DEFAULT 0;
      ALTER TABLE foods ADD COLUMN sodium_mg REAL NOT NULL DEFAULT 0;
      ALTER TABLE foods ADD COLUMN saturated_fat_g REAL NOT NULL DEFAULT 0;
      ALTER TABLE foods ADD COLUMN monounsaturated_fat_g REAL NOT NULL DEFAULT 0;
    `);
    
    console.log('✅ Added new nutrient columns to foods table');
    
    // Add new columns to daily_records table
    db.exec(`
      ALTER TABLE daily_records ADD COLUMN total_added_sugars_g REAL NOT NULL DEFAULT 0;
      ALTER TABLE daily_records ADD COLUMN total_sodium_mg REAL NOT NULL DEFAULT 0;
      ALTER TABLE daily_records ADD COLUMN total_saturated_fat_g REAL NOT NULL DEFAULT 0;
      ALTER TABLE daily_records ADD COLUMN total_monounsaturated_fat_g REAL NOT NULL DEFAULT 0;
    `);
    
    console.log('✅ Added new nutrient columns to daily_records table');
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

export function down() {
  const db = getDatabase();
  
  console.log('📍 Rolling back migration: Removing new nutrient columns...');
  
  try {
    // Note: SQLite does not support DROP COLUMN directly
    // You would need to recreate tables without these columns if rollback is needed
    console.log('⚠️ SQLite does not support DROP COLUMN. Manual rollback required.');
    console.log('To rollback: delete the database and recreate from schema.sql');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    throw error;
  }
}

// Run migration if this file is executed directly
import { fileURLToPath } from 'url';

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  up();
}
