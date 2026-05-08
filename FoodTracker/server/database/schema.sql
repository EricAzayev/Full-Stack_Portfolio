-- FoodTracker SQLite Database Schema

-- User profile table
CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY CHECK (id = 1), -- Only one user per database
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    height REAL NOT NULL, -- in cm
    weight REAL NOT NULL, -- in kg
    activity_level TEXT NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    calorie_goal INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Food library table
CREATE TABLE IF NOT EXISTS foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    serving_size_g REAL NOT NULL,
    calories_kcal REAL NOT NULL,
    is_probiotic INTEGER NOT NULL DEFAULT 0, -- SQLite uses 0/1 for boolean
    
    -- Macronutrients
    protein_g REAL NOT NULL DEFAULT 0,
    carbohydrates_g REAL NOT NULL DEFAULT 0,
    fats_g REAL NOT NULL DEFAULT 0,
    fiber_g REAL NOT NULL DEFAULT 0,
    
    -- Micronutrients
    omega3_dha_epa_mg REAL NOT NULL DEFAULT 0,
    vitamin_b12_mcg REAL NOT NULL DEFAULT 0,
    choline_mg REAL NOT NULL DEFAULT 0,
    magnesium_mg REAL NOT NULL DEFAULT 0,
    iron_mg REAL NOT NULL DEFAULT 0,
    zinc_mg REAL NOT NULL DEFAULT 0,
    calcium_mg REAL NOT NULL DEFAULT 0,
    vitamin_d_mcg REAL NOT NULL DEFAULT 0,
    vitamin_c_mg REAL NOT NULL DEFAULT 0,
    collagen_g REAL NOT NULL DEFAULT 0,
    
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Daily records table (combines today.js and record.js concept)
CREATE TABLE IF NOT EXISTS daily_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE, -- Format: YYYY-MM-DD
    total_calories REAL NOT NULL DEFAULT 0,
    
    -- Aggregated nutrients
    total_protein_g REAL NOT NULL DEFAULT 0,
    total_carbohydrates_g REAL NOT NULL DEFAULT 0,
    total_fats_g REAL NOT NULL DEFAULT 0,
    total_fiber_g REAL NOT NULL DEFAULT 0,
    total_omega3_dha_epa_mg REAL NOT NULL DEFAULT 0,
    total_vitamin_b12_mcg REAL NOT NULL DEFAULT 0,
    total_choline_mg REAL NOT NULL DEFAULT 0,
    total_magnesium_mg REAL NOT NULL DEFAULT 0,
    total_iron_mg REAL NOT NULL DEFAULT 0,
    total_zinc_mg REAL NOT NULL DEFAULT 0,
    total_calcium_mg REAL NOT NULL DEFAULT 0,
    total_vitamin_d_mcg REAL NOT NULL DEFAULT 0,
    total_vitamin_c_mg REAL NOT NULL DEFAULT 0,
    total_collagen_g REAL NOT NULL DEFAULT 0,
    
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Food items consumed per day
CREATE TABLE IF NOT EXISTS daily_food_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    daily_record_id INTEGER NOT NULL,
    food_id INTEGER NOT NULL,
    servings REAL NOT NULL,
    
    FOREIGN KEY (daily_record_id) REFERENCES daily_records(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE RESTRICT,
    UNIQUE(daily_record_id, food_id)
);

-- Deleted foods (temporary storage)
CREATE TABLE IF NOT EXISTS deleted_foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    food_name TEXT NOT NULL,
    food_data TEXT NOT NULL, -- JSON string of the food's data
    deleted_at TEXT DEFAULT (datetime('now'))
);

-- System metadata
CREATE TABLE IF NOT EXISTS system_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_records_date ON daily_records(date);
CREATE INDEX IF NOT EXISTS idx_daily_food_items_record ON daily_food_items(daily_record_id);
CREATE INDEX IF NOT EXISTS idx_daily_food_items_food ON daily_food_items(food_id);
CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name);
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category);

-- Triggers to update timestamps
CREATE TRIGGER IF NOT EXISTS update_user_profile_timestamp 
    AFTER UPDATE ON user_profile
    BEGIN
        UPDATE user_profile SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_foods_timestamp 
    AFTER UPDATE ON foods
    BEGIN
        UPDATE foods SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_daily_records_timestamp 
    AFTER UPDATE ON daily_records
    BEGIN
        UPDATE daily_records SET updated_at = datetime('now') WHERE id = NEW.id;
    END;
