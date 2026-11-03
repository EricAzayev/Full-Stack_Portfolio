import { pool } from "../config/database.js";
import { descriptions, costs } from "../data/armories.js";

// DB row shape: { name, description, cost, type }
const fallbackArmories = Object.entries(descriptions).map(([name, description]) => ({
  name,
  description,
  cost: costs[name],
  type: "piece",
}));

const getArmories = async (req, res) => {
  try {
    const results = await pool.query("SELECT * FROM armories ORDER BY id ASC");
    res.status(200).json(results.rows);
  } catch (err) {
    console.error("DB query failed in getArmories:", err.message);
    // DB unavailable - fall back to seeded armory data so frontend still renders
    res.status(200).json(fallbackArmories);
  }
};

const getArmoryById = async (req, res) => {
  try {
    const selectQuery = `
      SELECT name, description, cost, type
      FROM armories
      WHERE id=$1
    `;
    const armoryId = req.params.armoryId;

    const result = await pool.query(selectQuery, [armoryId]);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("DB query failed in getArmoryById:", err.message);
    res.status(200).json(fallbackArmories[req.params.armoryId]);
  }
};


const updateArmory = async (req, res) => {
  try {
    const updateQuery = `
      UPDATE armories
      SET name = $1, description = $2, cost = $3, type = $4
      WHERE id = $5
    `;
    const values = [req.body.name, req.body.description, req.body.cost, req.body.type, req.params.armoryId];
    await pool.query(updateQuery, values);
    res.status(200).json({ message: "Armory updated successfully" });
  } catch (err) {
    // DB unavailable - writes cannot be served without Postgres
    res.status(503).json({ success: false, error: "Database unavailable - cannot update armory" });
  }
};

const deleteArmory = async (req, res) => {
  try {
    const deleteQuery = `
      DELETE FROM armories
      WHERE id = $1
    `;
    const values = [req.params.armoryId];
    await pool.query(deleteQuery, values);
    res.status(200).json({ message: "Armory deleted successfully" });
  } catch (err) {
    // DB unavailable - writes cannot be served without Postgres
    res.status(503).json({ success: false, error: "Database unavailable - cannot delete armory" });
  }
};

export default {
  getArmories,
  getArmoryById,
  updateArmory,
};