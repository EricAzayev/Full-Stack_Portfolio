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


  // Ensure data directory exists
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // CRITICAL: Write package.json to ensure Node treats these .js files as ESM (modules)
  // causing imports to fail if this is missing (since they use export default)
  const pkgJsonPath = path.join(destDir, "package.json");
  if (!fs.existsSync(pkgJsonPath)) {
    fs.writeFileSync(pkgJsonPath, JSON.stringify({ type: "module" }, null, 2));
    console.log(`✅ Created package.json in data directory`);
  }

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
