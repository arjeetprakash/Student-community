import LandingPage from "./pages/LandingPage";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import AuthPage from "./pages/AuthPage";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
<Route path="/login" element={<AuthPage />} />
        <Route path="/home/*" element={<App />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
