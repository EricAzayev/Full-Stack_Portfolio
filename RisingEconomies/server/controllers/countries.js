import { pool } from "../config/database.js";
import fallbackCountries from "../data/countries.js";

const getCountries = async (req, res) => {
  try {
    const results = await pool.query("SELECT * FROM countries ORDER BY id ASC");
    return res.status(200).json(results.rows);
  } catch (err) {
    console.error("DB query failed in getCountries:", err);
    // Database unavailable: fall back to the bundled dataset (same shape as the DB rows)
    return res.status(200).json(fallbackCountries);
  }
};

export default { getCountries };
