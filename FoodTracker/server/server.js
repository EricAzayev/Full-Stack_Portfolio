import express from "express";
import cors from "cors";
const app = express();
import foodRouter from "./routes/food.js";
//middleware configs process requests before they reach the route handlers
app.use(cors()); // Enable CORS for all routes
app.use("/public", express.static("./public")); //server any images from public directory

app.use("/scripts", express.static("./public/scripts")); //server any scripts from public/scripts directory
app.use("/api", foodRouter); // Mount food router for API endpoints

app.get("/", (req, res) => {
  res
    .status(200)
    .send(
      '<h1 style="text-align: center; margin-top: 50px;">Food Tracker API</h1>'
    );
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
}); //npm start
