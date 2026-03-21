import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function Profile() {
  const [role, setRole] = useState(localStorage.getItem("role") || "student");
  const [email, setEmail] = useState(localStorage.getItem("email") || "");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location = "/";
      return;
    }
    setRole(localStorage.getItem("role") || "student");
    setEmail(localStorage.getItem("email") || "");
  }, []);

  return (
    <div className="app-shell">
      <Navbar role={role} />
      <div className="hero">
        <h1>Profile</h1>
        <p>Manage your account details</p>
      </div>
      <div className="section-card stack">
        <div><strong>Email:</strong> {email}</div>
        <div><strong>Role:</strong> {role}</div>
      </div>
    </div>
  );
}
