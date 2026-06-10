const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { fork } = require("child_process");

let mainWindow;
let serverProcess = null;

function configureUserDataPath() {
  if (!app.isPackaged) {
    return;
  }

  const exePath = process.execPath;
  const installRoot = path.dirname(exePath);
  const installHash = crypto
    .createHash("sha256")
    .update(installRoot)
    .digest("hex")
    .slice(0, 12);
  const isolatedUserDataPath = path.join(app.getPath("appData"), `${app.getName()}-${installHash}`);

  app.setPath("userData", isolatedUserDataPath);

  console.log("📍 [Electron] Using isolated packaged userData path:", isolatedUserDataPath);
  console.log("📍 [Electron] Isolation hash derived from install root:", installRoot);
}

configureUserDataPath();

function getServerRuntimeConfig() {
  const serverDir = app.isPackaged
    ? path.join(process.resourcesPath, "server")
    : path.join(__dirname, "../server");

  return {
    serverDir,
    serverPath: path.join(serverDir, "server.js"),
    userDataPath: path.join(app.getPath("userData"), "data"),
    port: app.isPackaged ? 0 : 3001,
    host: "127.0.0.1",
  };
}

function startServer() {
  return new Promise((resolve, reject) => {
    try {
      const { serverDir, serverPath, userDataPath, port, host } = getServerRuntimeConfig();

      console.log("📍 [Electron] Starting server from:", serverPath);
      console.log("📍 [Electron] Server working directory:", serverDir);
      console.log("📍 [Electron] __dirname:", __dirname);

      if (!fs.existsSync(serverPath)) {
        reject(new Error(`Packaged server entry was not found at ${serverPath}`));
        return;
      }

      let didResolve = false;
      const readyTimeout = setTimeout(() => {
        if (!didResolve) {
          reject(new Error("Timed out waiting for the packaged backend to start."));
        }
      }, 15000);

      serverProcess = fork(serverPath, [], {
        cwd: serverDir,
        silent: false,
        stdio: ["ignore", "inherit", "inherit", "ipc"],
        env: {
          ...process.env,
          USER_DATA_PATH: userDataPath,
          PORT: String(port),
          HOST: host,
        },
      });

      console.log("📍 [Electron] Server process forked with USER_DATA_PATH:", userDataPath);
      console.log("📍 [Electron] Server process forked, PID:", serverProcess.pid);

      serverProcess.on("message", (message) => {
        console.log("📍 [Electron] Received message from server:", message);

        if (message === "server-ready") {
          didResolve = true;
          clearTimeout(readyTimeout);
          resolve({ host, port });
          return;
        }

        if (message && message.type === "server-ready") {
          didResolve = true;
          clearTimeout(readyTimeout);
          resolve({
            host: message.host || host,
            port: message.port,
          });
        }
      });

      serverProcess.on("error", (error) => {
        clearTimeout(readyTimeout);
        console.error("❌ [Electron] Failed to start server:", error);
        reject(error);
      });

      serverProcess.on("exit", (code, signal) => {
        clearTimeout(readyTimeout);
        console.log(`⚠️  [Electron] Server process exited with code ${code} and signal ${signal}`);
        if (!didResolve) {
          reject(new Error(`Backend exited before it was ready (code: ${code}, signal: ${signal})`));
        }
      });
    } catch (error) {
      console.error("❌ [Electron] Error starting server:", error);
      reject(error);
    }
  });
}

function createWindow(apiBaseUrl) {
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
  console.log("📍 [Electron] Renderer API base URL:", apiBaseUrl || "not set");

  if (apiBaseUrl) {
    mainWindow.loadFile(indexPath, {
      query: {
        apiBaseUrl,
      },
    });
  } else {
    mainWindow.loadFile(indexPath);
  }

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

    const serverInfo = await startServer();
    console.log("✅ [Electron] Server startup completed on:", serverInfo);

    console.log("📍 [Electron] Creating main window...");
    createWindow(`http://${serverInfo.host}:${serverInfo.port}`);
  } catch (error) {
    console.error("❌ [Electron] Failed to start application:", error);
    if (app.isPackaged) {
      const errorWindow = new BrowserWindow({
        width: 720,
        height: 420,
        autoHideMenuBar: true,
        title: "FoodTracker startup error",
      });
      errorWindow.loadURL(`data:text/html,${encodeURIComponent(`
        <html>
          <body style="font-family: sans-serif; padding: 24px; line-height: 1.5;">
            <h1>FoodTracker could not start its local backend</h1>
            <p>This packaged app will not fall back to another FoodTracker server on this machine.</p>
            <pre style="white-space: pre-wrap; background: #f4f4f4; padding: 12px; border-radius: 8px;">${error.message}</pre>
          </body>
        </html>
      `)}`);
    } else {
      createWindow("http://127.0.0.1:3001");
    }
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
