import { pool } from "../config/database.js";
import fallbackEvents from "../data/events.js";

// Shift seed dates so the earliest event is tomorrow - keeps the demo's
// "upcoming hikes" story true no matter when it runs without a database.
const upcomingFallbackEvents = () => {
  const dates = fallbackEvents.map((e) => new Date(e.date + "T12:00:00").getTime());
  const offset = Date.now() + 24 * 60 * 60 * 1000 - Math.min(...dates);
  return fallbackEvents.map((e) => ({
    ...e,
    date: new Date(new Date(e.date + "T12:00:00").getTime() + offset)
      .toISOString()
      .slice(0, 10),
  }));
};

const getEvents = async (req, res) => {
  try {
    const results = await pool.query("SELECT * FROM events ORDER BY id ASC");
    res.status(200).json(results.rows);
  } catch (err) {
    console.error("DB query failed in getEvents:", err.message);
    // DB unavailable - fall back to seeded event data so frontend still renders
    res.status(200).json(upcomingFallbackEvents());
  }
};

const getEventById = async (req, res) => {
  try {
    const selectQuery = `
      SELECT date, mountain, organizer, register, miles, startTime, duration
      FROM events
      WHERE id=$1
    `;
    const eventId = req.params.eventId;

    const result = await pool.query(selectQuery, [eventId]);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("DB query failed in getEventById:", err.message);
    res.status(200).json(fallbackEvents.find((e) => e.id === req.params.eventId));
  }
};

export default {
  getEvents,
  getEventById,
};