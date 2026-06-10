const runtimeParams = new URLSearchParams(window.location.search);
const runtimeApiBaseUrl = runtimeParams.get("apiBaseUrl");
const isFileProtocol = window.location.protocol === "file:";

export const API_BASE_URL = runtimeApiBaseUrl || (isFileProtocol ? null : "http://127.0.0.1:3001");

export function apiUrl(route) {
  if (!API_BASE_URL) {
    throw new Error("FoodTracker backend URL is missing for this packaged app instance.");
  }

  const normalizedRoute = route.startsWith("/") ? route.slice(1) : route;
  const baseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;

  return new URL(normalizedRoute, baseUrl).toString();
}