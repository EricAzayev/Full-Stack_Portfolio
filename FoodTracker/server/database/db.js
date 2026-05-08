import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { getDataDir } from "../utils/pathUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

/**
 * Initialize the SQLite database
 * @returns {Database} The database instance
 */
export function initDatabase() {
  if (db) {
    return db;
  }

  console.log("📍 [Database] Initializing SQLite database...");

  // Create database in the data directory
  const dataDir = getDataDir();
  const dbPath = path.join(dataDir, "foodtracker.db");

  console.log("📍 [Database] Database path:", dbPath);

  // Initialize database connection
  db = new Database(dbPath);

  // Enable foreign keys
  db.pragma("foreign_keys = ON");

  // Enable WAL mode for better concurrency
  db.pragma("journal_mode = WAL");

  console.log("✅ [Database] Database connection established");

  // Run schema
  runSchema();

  console.log("✅ [Database] Database initialized successfully");

  return db;
}

/**
 * Run the database schema
 */
function runSchema() {
  console.log("📍 [Database] Running schema...");

  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  // Execute the entire schema at once
  try {
    db.exec(schema);
    console.log("✅ [Database] Schema applied successfully");
  } catch (error) {
    console.error("❌ [Database] Error executing schema:", error.message);
    throw error;
  }
}

/**
 * Get the database instance
 * @returns {Database} The database instance
 */
export function getDatabase() {
  if (!db) {
    return initDatabase();
  }
  return db;
}

/**
 * Close the database connection
 */
export function closeDatabase() {
  if (db) {
    console.log("📍 [Database] Closing database connection...");
    db.close();
    db = null;
    console.log("✅ [Database] Database connection closed");
  }
}

/**
 * Execute a transaction
 * @param {Function} callback Function to execute within the transaction
 * @returns {*} The result of the callback
 */
export function transaction(callback) {
  const db = getDatabase();
  const txn = db.transaction(callback);
  return txn();
}

export default {
  initDatabase,
  getDatabase,
  closeDatabase,
  transaction,
};
