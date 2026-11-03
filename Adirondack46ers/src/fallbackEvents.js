// Bundled seed so the UI renders populated with no backend (static deploy).
import fallbackEvents from "../server/data/events.js";

// Same date-shifting the server controller does: earliest seed event
// becomes tomorrow so the "upcoming hikes" story holds at any run date.
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

export default upcomingFallbackEvents;