import { pool } from "../config/database.js";

// Simple user creation (no login needed)
const createUser = async (req, res) => {
  try {
    // Create default user with ID 1
    const newUser = await pool.query(
      "INSERT INTO users (id, username) VALUES (1, 'default_user') ON CONFLICT (id) DO NOTHING RETURNING *"
    );

    // Create default player data with 70 gold
    await pool.query(
      "INSERT INTO player_data (user_id, gold, pieces) VALUES (1, 70, '{}') ON CONFLICT (user_id) DO UPDATE SET gold = 70"
    );

    res.status(200).json({ message: "User ready with 70 gold" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get player data (gold and pieces)
const getPlayerData = async (req, res) => {
  try {
    const query = "SELECT * FROM player_data WHERE user_id = 1";
    const result = await pool.query(query);

    if (result.rows.length === 0) {
      // Initialize with 70 gold if no data exists
      await pool.query(
        "INSERT INTO player_data (user_id, gold, pieces) VALUES (1, 70, '{}')"
      );
      res.status(200).json({ gold: 70, pieces: {} });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    console.error("Error getting player data:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update player data (gold and pieces)
const updatePlayerData = async (req, res) => {
  try {
    const { userId, gold, pieces } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const updateQuery = `
      UPDATE player_data 
      SET gold = $1, pieces = $2, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $3
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [gold, pieces, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Player data not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating player data:", error);
    res.status(500).json({ error: error.message });
  }
};

// Save armory
const saveArmory = async (req, res) => {
  try {
    const { userId, name, board, pieces, cost } = req.body;

    if (!userId || !name || !board || !pieces || cost === null || cost === undefined) {
      return res.status(400).json({ error: "Missing required fields or invalid cost" });
    }

    const insertQuery = `
      INSERT INTO saved_armories (user_id, name, board, pieces, cost)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      userId,
      name,
      JSON.stringify(board),
      JSON.stringify(pieces),
      cost
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error saving armory:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update armory
const updateArmory = async (req, res) => {
  try {
    const { armoryId, name, board, pieces, cost } = req.body;

    if (!armoryId || cost === null || cost === undefined) {
      return res.status(400).json({ error: "Armory ID is required and cost must be valid" });
    }

    const updateQuery = `
      UPDATE saved_armories 
      SET name = $1, board = $2, pieces = $3, cost = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [
      name,
      JSON.stringify(board),
      JSON.stringify(pieces),
      cost,
      armoryId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Armory not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating armory:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete armory
const deleteArmory = async (req, res) => {
  try {
    const { armoryId } = req.params;

    const deleteQuery = "DELETE FROM saved_armories WHERE id = $1 RETURNING *";
    const result = await pool.query(deleteQuery, [armoryId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Armory not found" });
    }

    res.status(200).json({ message: "Armory deleted successfully" });
  } catch (error) {
    console.error("Error deleting armory:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get user's saved armories
const getUserArmories = async (req, res) => {
  try {
    const { userId } = req.params;

    const query = `
      SELECT * FROM saved_armories 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error getting user armories:", error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  createUser,
  getPlayerData,
  updatePlayerData,
  saveArmory,
  updateArmory,
  deleteArmory,
  getUserArmories
};

