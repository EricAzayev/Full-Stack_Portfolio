import { app } from "electron";
import path from "path";
import fs from "fs";

/**
 * Get the path to the data directory for the Electron app
 * In development: uses the project's server/data directory
 * In production: uses the app's userData directory
 */
export function getDataPath(filename = "") {
  let dataDir;

  if (app.isPackaged) {
    // Production: Use app's userData directory
    dataDir = path.join(app.getPath("userData"), "data");
  } else {
    // Development: Use project directory
    dataDir = path.join(process.cwd(), "server", "data");
  }

  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  return filename ? path.join(dataDir, filename) : dataDir;
}

/**
 * Initialize data files in production if they don't exist
 * Copies default data from the app bundle to userData
 */
export function initializeDataFiles() {
  if (!app.isPackaged) return; // Skip in development

  const sourceDir = path.join(app.getAppPath(), "server", "data");
  const destDir = getDataPath();


  const dataFiles = [
    "foodLibrary.js",
    "foodDeletedLibrary.js",
    "today.js",
    "lastReset.js",
    "record.js",
    "user.js",
    "nutrientCalculator.js",
    "README.md"
  ];

  dataFiles.forEach((file) => {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destDir, file);


    if (fs.existsSync(sourcePath) && !fs.existsSync(destPath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Initialized data file: ${file}`);
    }
  });
}
