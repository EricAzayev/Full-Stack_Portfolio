const { app, BrowserWindow } = require("electron");
const path = require("path");
const { pathToFileURL } = require("url");

let mainWindow;
let serverStarted = false;

async function startServer() {
  if (serverStarted) return;
  
  try {
    // Dynamically import the ES module server
    const serverPath = path.join(__dirname, "../server/server.js");
    const serverURL = pathToFileURL(serverPath).href;
    const serverModule = await import(serverURL);
    serverModule.startServer();
    serverStarted = true;
    console.log("✅ Express server started successfully");
  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    autoHideMenuBar: true, // Hide menu bar for cleaner look
    title: "FoodTracker"
  });

  // Load the built frontend
  const indexPath = path.join(__dirname, "../dist/index.html");
  mainWindow.loadFile(indexPath);

  // Open DevTools in development (optional)
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await startServer();
  
  // Give server a moment to start
  setTimeout(() => {
    createWindow();
  }, 1000);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Handle app errors
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
