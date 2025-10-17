import express from "express";
import "./config/dotenv.js"; // Load environment variables from .env file
import cors from "cors";

const app = express();
import armoriesRouter from "./routes/armories.js";
//middleware configs process requests before they reach the route handlers

app.use(cors());

// app.use("/public", express.static("./public")); //server any images from public directory

// app.use("/scripts", express.static("./public/scripts")); //server any scripts from public/scripts directory
app.use("/armories", armoriesRouter); // Mount armories router after middleware configuration

app.get("/", (req, res) => {
  res
    .status(200)
    .send(
      '<h1 style="text-align: center; margin-top: 50px;">UnEarthed API</h1>'
    ); //sending html tags, perhaps react elements later?
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
}); //npm start
