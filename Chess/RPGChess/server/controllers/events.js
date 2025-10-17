import { pool } from "../config/database.js";

const getArmories = async (req, res) => {
  try {
    const results = await pool.query("SELECT * FROM armories ORDER BY id ASC");
    res.status(200).json(results.rows);
  } catch (error) {
    res.status(409).json({ error: error.message });
  }
};

const getArmoryById = async (req, res) => {
  try {
    const selectQuery = `
      SELECT name, description, cost, type, stats
      FROM armories
      WHERE id=$1
    `;
    const armoryId = req.params.armoryId;

    const result = await pool.query(selectQuery, [armoryId]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(409).json({ error: error.message });
  }
};

export default {
  getArmories,
  getArmoryById,
};
