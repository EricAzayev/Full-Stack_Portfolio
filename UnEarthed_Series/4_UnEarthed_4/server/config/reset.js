import { pool } from "./database.js";

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });



// Basic env check to avoid confusing connection errors when .env is missing
const requiredEnv = ['PGHOST', 'PGUSER', 'PGPASSWORD', 'PGPORT', 'PGDATABASE'];
const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length > 0) {
    console.error('Missing required database environment variables:', missing.join(', '));
    console.error('Copy .env.example to .env and fill in your Postgres credentials, then re-run `npm run reset`.');
    process.exit(1);
}
import giftData from "../data/gifts.js";

const createGiftsTable = async () => {
  const createTableQuery = `
    DROP TABLE IF EXISTS gifts;

    CREATE TABLE IF NOT EXISTS gifts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        pricePoint VARCHAR(10) NOT NULL,
        audience VARCHAR(255) NOT NULL,
        image VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        submittedBy VARCHAR(255) NOT NULL,
        submittedOn TIMESTAMP NOT NULL)
    `;
  try {
    await pool.query(createTableQuery);
    console.log("🎉 gifts table created successfully");
  } catch (err) {
    console.error("Error creating gifts table", err);
    throw err;
  }
};

const seedGiftsTable = async () => {
  await createGiftsTable(); // Ensure the table is created before seeding

  for (const gift of giftData) {
    const insertQuery = {
      text: "INSERT INTO gifts (name, pricePoint, audience, image, description, submittedBy, submittedOn) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    };

    const values = [
      gift.name,
      gift.pricePoint,
      gift.audience,
      gift.image,
      gift.description,
      gift.submittedBy,
      gift.submittedOn,
    ];

    try {
      await pool.query(insertQuery, values);
      console.log(`✅ ${gift.name} added successfully`);
    } catch (err) {
      console.error("⚠️ error inserting gift", err);
    }
  }
};

seedGiftsTable().catch((err) => {
  console.error("Seeding failed", err);
  process.exit(1);
});
