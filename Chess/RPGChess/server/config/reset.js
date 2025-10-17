import { pool } from "./database.js";

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

// Basic env check to avoid confusing connection errors when .env is missing
const requiredEnv = ["PGHOST", "PGUSER", "PGPASSWORD", "PGPORT", "PGDATABASE"];
const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(
    "Missing required database environment variables:",
    missing.join(", ")
  );
  console.error(
    "Copy .env.example to .env and fill in your Postgres credentials, then re-run `npm run reset`."
  );
  process.exit(1);
}
import armoryData from "../data/armories.js";

const createArmoriesTable = async () => {
  const createTableQuery = `
    DROP TABLE IF EXISTS armories;

    CREATE TABLE IF NOT EXISTS armories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        cost INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL,
        stats JSONB
    )
  `;
  try {
    await pool.query(createTableQuery);
    console.log("🎉 armories table created successfully");
  } catch (err) {
    console.error("Error creating armories table", err);
    throw err;
  }
};

const seedArmoriesTable = async () => {
  await createArmoriesTable(); // Ensure the table is created before seeding

  for (const armory of armoryData) {
    const insertQuery = {
      text: "INSERT INTO armories (name, description, cost, type, stats) VALUES ($1, $2, $3, $4, $5)",
    };

    const values = [
      armory.name,
      armory.description,
      armory.cost,
      armory.type,
      armory.stats,
    ];

    try {
      await pool.query(insertQuery, values);
      console.log(
        `✅ ${armory.name} armory added successfully`
      );
    } catch (err) {
      console.error("⚠️ error inserting armory", err);
    }
  }
};

seedArmoriesTable().catch((err) => {
  console.error("Seeding failed", err);
  process.exit(1);
});
