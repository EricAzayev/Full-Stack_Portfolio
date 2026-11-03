// Bundled seed so the UI renders populated with no backend (static deploy).
import fallbackGifts from "../server/data/gifts.js";

// Same DB-shaped mapping the server controller applies to the seed.
const toDbShape = (g) => ({
  id: g.id,
  name: g.name,
  pricepoint: g.pricePoint,
  audience: g.audience,
  image: g.image,
  description: g.description,
  submittedby: g.submittedBy,
  submittedon: g.submittedOn,
});

export default fallbackGifts.map(toDbShape);