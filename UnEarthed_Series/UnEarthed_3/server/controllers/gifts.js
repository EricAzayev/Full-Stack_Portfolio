import { pool } from '../config/database.js';
import fallbackGifts from '../data/gifts.js';
const toDbShape = (g) => ({ id: g.id, name: g.name, pricepoint: g.pricePoint, audience: g.audience, image: g.image, description: g.description, submittedby: g.submittedBy, submittedon: g.submittedOn });
const fallbackRows = fallbackGifts.map(toDbShape);

const getGifts = async (req, res) => {
  try {
    const results = await pool.query('SELECT * FROM gifts ORDER BY id ASC');
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
    `
    const giftId = req.params.giftId;

    const result = await pool.query(selectQuery);
    res.status(200).json(result.rows[0])
  } catch (err) {
    console.error("DB query failed in getGiftById:", err.message);
    res.status(200).json(fallbackRows.find(g => g.id === req.params.giftId));
  }
}

export default {
  getGifts,
  getGiftById
};