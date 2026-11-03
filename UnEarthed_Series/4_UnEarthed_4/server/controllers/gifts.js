import { pool } from "../config/database.js";
import fallbackGifts from "../data/gifts.js";
const toDbShape = (g) => ({ id: g.id, name: g.name, pricepoint: g.pricePoint, audience: g.audience, image: g.image, description: g.description, submittedby: g.submittedBy, submittedon: g.submittedOn });
const fallbackRows = fallbackGifts.map(toDbShape);

const getGifts = async (req, res) => {
  try {
    const results = await pool.query("SELECT * FROM gifts ORDER BY id ASC");
    res.status(200).json(results.rows);
  } catch (err) {
    console.error("DB query failed in getGifts:", err.message);
    // DB unavailable - fall back to seeded gift data so frontend still renders
    res.status(200).json(fallbackRows);
  }
};

const getGiftById = async (req, res) => {
  try {
    const selectQuery = `
      SELECT name, pricePoint, audience, image, description, submittedBy, submittedOn
      FROM gifts
      WHERE id=$1
    `;
    const giftId = req.params.giftId;

    const result = await pool.query(selectQuery);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("DB query failed in getGiftById:", err.message);
    res.status(200).json(fallbackRows.find((g) => g.id === req.params.giftId));
  }
};

const createGift = async (req, res) => {
  try {
    const {
      name,
      pricepoint,
      audience,
      image,
      description,
      submittedby,
      submittedon,
    } = req.body;
    const query = `INSERT INTO gifts (name, pricepoint, audience, image, description,
    submittedby, submittedon)
    VALUES($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`;
    const attributesList = [
      name,
      pricepoint,
      audience,
      image,
      description,
      submittedby,
      submittedon,
    ];
    const results = await pool.query(query, attributesList);
    res.status(201).json(results.rows[0]); //append to the very top
  } catch (err) {
    // DB unavailable - writes cannot be served without Postgres
    res.status(503).json({ success: false, error: "Database unavailable - cannot create gift" });
  }
};

const updateGift = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      name,
      pricepoint,
      audience,
      image,
      description,
      submittedby,
      submittedon,
    } = req.body;
    const query =
      "UPDATE gifts SET name = $1, pricepoint = $2, audience = $3, image = $4, description = $5, submittedby = $6, submittedon = $7 WHERE id = $8";
    const attributesList = [
      name,
      pricepoint,
      audience,
      image,
      description,
      submittedby,
      submittedon,
      id,
    ];
    const result = await pool.query(query, attributesList);

    res.status(200).json(result.rows[0]);
  } catch (err) {
    // DB unavailable - writes cannot be served without Postgres
    res.status(503).json({ success: false, error: "Database unavailable - cannot update gift" });
  }
};

const deleteGift = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const results = await pool.query("DELETE FROM gifts WHERE id = $1", [id]);
    res.status(200).json(results.rows[0]);
  } catch (err) {
    // DB unavailable - writes cannot be served without Postgres
    res.status(503).json({ success: false, error: "Database unavailable - cannot delete gift" });
  }
};

export default {
  getGifts,
  getGiftById,

  updateGift,
  createGift,
  deleteGift,
};