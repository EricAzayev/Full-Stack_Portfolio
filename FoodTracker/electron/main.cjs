const { app, BrowserWindow } = require("electron");
const path = require("path");
const { fork } = require("child_process");

let mainWindow;
let serverProcess = null;

function startServer() {
  return new Promise((resolve, reject) => {
    try {
      const serverPath = path.join(__dirname, "../server/server.js");
      console.log("📍 [Electron] Starting server from:", serverPath);
      console.log("📍 [Electron] __dirname:", __dirname);

      // Use fork to run the server in a separate Node process
      // fork preserves the working directory and NODE_PATH better
      const userDataPath = app.getPath("userData");
      const appDataPath = path.join(userDataPath, "data");

      serverProcess = fork(serverPath, [], {
        silent: false, // Show console output
        stdio: ["ignore", "inherit", "inherit", "ipc"],
        env: {
          ...process.env,
          USER_DATA_PATH: appDataPath
        }
      });
      console.log("📍 [Electron] Server process forked with USER_DATA_PATH:", appDataPath);

      console.log("📍 [Electron] Server process forked, PID:", serverProcess.pid);
      let serverReady = false;

      serverProcess.on("message", (message) => {
        console.log("📍 [Electron] Received message from server:", message);
        if (message === "server-ready") {
          if (!serverReady) {
            serverReady = true;
            console.log("✅ [Electron] Server confirmed ready");
            resolve();
          }
        }
      });

      serverProcess.on("error", (error) => {
        console.error("❌ [Electron] Failed to start server:", error);
        if (!serverReady) {
          reject(error);
        }
      });

      serverProcess.on("exit", (code, signal) => {
        console.log(`⚠️  [Electron] Server process exited with code ${code} and signal ${signal}`);
      });

      // Timeout after 15 seconds
      setTimeout(() => {
        if (!serverReady) {
          console.warn("⚠️  [Electron] Server startup timeout, proceeding anyway");
          resolve();
        }
      }, 15000);
    } catch (error) {
      console.error("❌ [Electron] Error starting server:", error);
      reject(error);
    }
  });
}

function createWindow() {
  console.log("📍 [Electron] Creating window...");
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
  console.log("📍 [Electron] Loading index.html from:", indexPath);
  mainWindow.loadFile(indexPath);

  // Log when page finishes loading
  mainWindow.webContents.on("did-finish-load", () => {
    console.log("✅ [Electron] Frontend loaded successfully");
  });

  mainWindow.webContents.on("crashed", () => {
    console.error("❌ [Electron] Frontend crashed");
  });

  // Attach console message listener
  mainWindow.webContents.on("console-message", (level, message, line, sourceId) => {
    console.log(`📍 [Frontend] ${message}`);
  });

  // Open DevTools in development (optional)
  if (!app.isPackaged) {
    console.log("📍 [Electron] Opening DevTools (dev mode)");
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    console.log("📍 [Electron] Window closed");
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  console.log("📍 [Electron] App ready, starting server...");

  try {
    // Initialize data files if in production
    if (app.isPackaged) {
      console.log("📍 [Electron] Initializing data files...");
      const { initializeDataFiles } = await import("./dataPath.js");
      initializeDataFiles();
    }

    await startServer();
    console.log("✅ [Electron] Server startup complete");

    // Give server time to bind to port
    setTimeout(() => {
      console.log("📍 [Electron] Creating main window...");
      createWindow();
    }, 1000);
  } catch (error) {
    console.error("❌ [Electron] Failed to start application:", error);
    createWindow(); // Still try to show window even if server fails
  }

  app.on("activate", () => {
    console.log("📍 [Electron] App activated");
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  console.log("📍 [Electron] All windows closed");
  // Kill server process before quitting
  if (serverProcess) {
    console.log("📍 [Electron] Killing server process...");
    serverProcess.kill();
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Handle app errors
process.on("uncaughtException", (error) => {
  console.error("❌ [Electron] Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ [Electron] Unhandled Rejection at:", promise, "reason:", reason);
});
