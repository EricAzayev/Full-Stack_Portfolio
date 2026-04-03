import express from "express";
import cors from "cors";
const app = express();

console.log("📍 [Server] Server.js loading...");
console.log("📍 [Server] Importing food router...");

let foodRouter;
try {
  const foodModule = await import("./routes/food.js");
  foodRouter = foodModule.default;
  console.log("✅ [Server] Food router imported successfully");
} catch (importError) {
  console.error("❌ [Server] CRITICAL: Failed to import food router:", importError);
  console.error("Error message:", importError.message);
  console.error("Stack:", importError.stack);
  process.exit(1);
}

//middleware configs process requests before they reach the route handlers
app.use(cors()); // Enable CORS for all routes
console.log("📍 [Server] CORS enabled");

app.use("/public", express.static("./public")); //server any images from public directory
console.log("📍 [Server] Static /public route configured");

app.use("/scripts", express.static("./public/scripts")); //server any scripts from public/scripts directory
console.log("📍 [Server] Static /scripts route configured");

app.use("/api", foodRouter); // Mount food router for API endpoints
console.log("📍 [Server] API routes mounted");

app.get("/", (req, res) => {
  console.log("📍 [Server] Root route accessed");
  res
    .status(200)
    .send(
      '<h1 style="text-align: center; margin-top: 50px;">Food Tracker API</h1>'
    );
});

const PORT = process.env.PORT || 3001;
console.log("📍 [Server] Using PORT:", PORT);

// Start the server
const server = app.listen(PORT, () => {
  console.log(`🚀 [Server] Server listening on http://localhost:${PORT}`);
  
  // Notify parent process (Electron) that server is ready
  if (process.send) {
    console.log("📍 [Server] Sending server-ready message to parent process");
    process.send("server-ready");
  } else {
    console.log("📍 [Server] No parent process (running standalone)");
  }
});

server.on("error", (error) => {
  console.error("❌ [Server] Server error:", error);
});

export function startServer() {
  return app;
}

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("📍 [Server] SIGTERM received, shutting down server");
  server.close(() => {
    console.log("✅ [Server] Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("📍 [Server] SIGINT received, shutting down server");
  server.close(() => {
    console.log("✅ [Server] Server closed");
    process.exit(0);
  });
});

console.log("📍 [Server] Server.js loaded successfully");
