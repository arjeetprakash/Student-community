import LandingPage from "./pages/LandingPage.jsx";
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import App from "./App";
import AuthPage from "./pages/AuthPage";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import ThemeToggle from "./components/ThemeToggle";
import { API_BASE_URL } from "./lib/apiBase";
import "./index.css";

axios.defaults.timeout = 12000;

axios.interceptors.request.use((config) => {
  if (typeof config.url === "string" && config.url.startsWith("http://localhost:5000")) {
    config.url = config.url.replace("http://localhost:5000", API_BASE_URL);
  }
  return config;
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/home/*" element={<App />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
