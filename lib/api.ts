"use strict";
// Single source of truth for API base URL used across the frontend.

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== "") return envUrl.trim();

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:5000";
  }

  return "https://streakfitx-backend.onrender.com";
}

export const API_BASE = getApiBaseUrl();
export default API_BASE;


