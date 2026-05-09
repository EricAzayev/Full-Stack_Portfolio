/**
 * Migration: Fix foreign key constraint to allow food deletion
 * Changes ON DELETE RESTRICT to ON DELETE CASCADE for food_id
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path
const DB_PATH = path.join(__dirname, '..', 'data', 'foodtracker.db');

console.log('🔧 [Migration] Fixing foreign key constraint...');
console.log(`📍 Database: ${DB_PATH}`);

try {
  const db = new Database(DB_PATH);
  
  // Enable foreign keys
  db.pragma('foreign_keys = OFF');
  
  // Begin transaction
  db.exec('BEGIN TRANSACTION');
  
  try {
    // Step 1: Rename old table
    console.log('📍 [Migration] Renaming old daily_food_items table...');
    db.exec(`ALTER TABLE daily_food_items RENAME TO daily_food_items_old`);
    
    // Step 2: Create new table with correct constraint
    console.log('📍 [Migration] Creating new daily_food_items table...');
    db.exec(`
      CREATE TABLE daily_food_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        daily_record_id INTEGER NOT NULL,
        food_id INTEGER NOT NULL,
        servings REAL NOT NULL,
        
        FOREIGN KEY (daily_record_id) REFERENCES daily_records(id) ON DELETE CASCADE,
        FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE,
        UNIQUE(daily_record_id, food_id)
      )
    `);
    
    // Step 3: Copy data from old table
    console.log('📍 [Migration] Copying data...');
    db.exec(`
      INSERT INTO daily_food_items (id, daily_record_id, food_id, servings)
      SELECT id, daily_record_id, food_id, servings
      FROM daily_food_items_old
    `);
    
    // Step 4: Drop old table
    console.log('📍 [Migration] Dropping old table...');
    db.exec(`DROP TABLE daily_food_items_old`);
    
    // Commit transaction
    db.exec('COMMIT');
    console.log('✅ [Migration] Foreign key constraint updated successfully!');
    
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  
  // Re-enable foreign keys
  db.pragma('foreign_keys = ON');
  
  db.close();
  console.log('✅ [Migration] Database closed');
  
} catch (error) {
  console.error('❌ [Migration] Error:', error.message);
  process.exit(1);
}
