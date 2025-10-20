import express from "express";
import "./config/dotenv.js"; // Load environment variables from .env file
import cors from "cors";
import { createUserTables } from "./config/schema.js";

const app = express();
import armoriesRouter from "./routes/armories.js";
import usersRouter from "./routes/users.js";
//middleware configs process requests before they reach the route handlers

app.use(cors());
app.use(express.json());

// app.use("/public", express.static("./public")); //server any images from public directory

// app.use("/scripts", express.static("./public/scripts")); //server any scripts from public/scripts directory
app.use("/armories", armoriesRouter); // Mount armories router after middleware configuration
app.use("/users", usersRouter); // Mount users router

app.get("/", (req, res) => {
  res
    .status(200)
    .send(
      '<h1 style="text-align: center; margin-top: 50px;">RPGChess API</h1>'
    ); //sending html tags, perhaps react elements later?
});

const PORT = process.env.PORT || 3002;

// Initialize database tables
createUserTables().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});
