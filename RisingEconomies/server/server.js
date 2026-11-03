import express from "express";
const app = express();
import countriesRouter from "./routes/countries.js";
//middleware configs process requests before they reach the route handlers
app.use("/public", express.static("./public")); //server any images from public directory

app.use("/scripts", express.static("./public/scripts")); //server any scripts from public/scripts directory
app.use("/countries", countriesRouter); // Mount gifts router after middleware configuration

// Serve the built frontend at the dashboard's project path (if it has been built)
import fs from "fs";
import path from "path";
import url from "url";
const dist = path.resolve(url.fileURLToPath(new URL(".", import.meta.url)), "..", "dist");
if (fs.existsSync(dist)) {
  app.use("/projects/rising-economies", express.static(dist, { index: false }));
  app.get("/projects/rising-economies/*", (req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.get("/", (req, res) => {
  res
    .status(200)
    .send(
      '<h1 style="text-align: center; margin-top: 50px;">Rising Economies API</h1>'
    ); //sending html tags, perhaps react elements later?
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
}); //npm start
