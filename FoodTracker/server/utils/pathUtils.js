import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get the path to the data directory.
 * In production (when USER_DATA_PATH env var is set), returns that path.
 * In development, returns the local server/data directory.
 */
export function getDataDir() {
  if (process.env.USER_DATA_PATH) {
    console.log("📍 [pathUtils] Using USER_DATA_PATH:", process.env.USER_DATA_PATH);
    return process.env.USER_DATA_PATH;
  }
  console.log("📍 [pathUtils] USER_DATA_PATH not set, using local fallback");
  // Fallback for development: use local ../data directory
  return path.join(__dirname, "../data");
}

/**
 * Get a properly formatted file URL for dynamic imports.
 * Handles Windows paths correctly.
 * @param {string} filename - The name of the file in the data directory
 */
export function getDataFileUrl(filename) {
  const filePath = path.join(getDataDir(), filename);
  return pathToFileURL(filePath).href;
}
