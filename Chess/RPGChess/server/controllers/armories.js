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
      SELECT name, description, cost, type
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
  } catch (error) {
    res.status(409).json({ error: error.message });
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
  } catch (error) {
    res.status(409).json({ error: error.message });
  }
};

export default {
  getArmories,
  getArmoryById,
  updateArmory,
};
