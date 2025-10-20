import { pool } from "./database.js";

const createUserTables = async () => {
  const createTablesQuery = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Player data table (gold, pieces)
    CREATE TABLE IF NOT EXISTS player_data (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        gold INTEGER DEFAULT 70,
        pieces JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Saved armories table
    CREATE TABLE IF NOT EXISTS saved_armories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        board JSONB NOT NULL,
        pieces JSONB NOT NULL,
        cost INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_player_data_user_id ON player_data(user_id);
    CREATE INDEX IF NOT EXISTS idx_saved_armories_user_id ON saved_armories(user_id);
  `;

  try {
    await pool.query(createTablesQuery);
    console.log("🎉 User tables created successfully");
  } catch (err) {
    console.error("Error creating user tables", err);
    throw err;
  }
};

export { createUserTables };
