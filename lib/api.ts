"use strict";
// Single source of truth for API base URL used across the frontend.

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== "") return envUrl.trim();

  if (process.env.NODE_ENV === "production") {
    console.error("❌ NEXT_PUBLIC_API_URL is missing in production!");
  }

  // Fallback for local dev only if env is missing, but warn
  console.warn("⚠️ NEXT_PUBLIC_API_URL not set, defaulting to localhost:5000");
  return "http://localhost:5000";
}

export const API_BASE = getApiBaseUrl();
export default API_BASE;


