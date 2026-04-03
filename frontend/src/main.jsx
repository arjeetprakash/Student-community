import LandingPage from "./pages/LandingPage.jsx";
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import App from "./App";
import AuthPage from "./pages/AuthPage";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import "./index.css";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "https://student-community-j7iy.onrender.com").replace(/\/$/, "");

axios.interceptors.request.use((config) => {
  if (typeof config.url === "string" && config.url.startsWith("http://localhost:5000")) {
    config.url = config.url.replace("http://localhost:5000", API_BASE_URL);
  }
  return config;
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/home/*" element={<App />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
