// Bundled seed so the armory/shop UI renders populated with no backend.
// Same row mapping the server controller applies: { name, description, cost, type }.
import { descriptions, costs } from "./data/armories.js";

export default Object.entries(descriptions).map(([name, description]) => ({
  name,
  description,
  cost: costs[name],
  type: "piece",
}));