const DEPLOYED_API = "https://student-community-j7iy.onrender.com";

function resolveDefaultApiBase() {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:5000";
    }
  }

  return DEPLOYED_API;
}

export const API_BASE_URL = (import.meta.env.VITE_API_URL || resolveDefaultApiBase()).replace(/\/$/, "");
