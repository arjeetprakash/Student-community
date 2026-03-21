import axios from "axios";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

export default function Admin() {
  const [notice, setNotice] = useState("");
  const [notices, setNotices] = useState([]);
  const [role, setRole] = useState(localStorage.getItem("role") || "admin");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    setRole(storedRole || "admin");

    if (!token) {
      window.location = "/";
      return;
    }

    if (storedRole !== "admin") {
      alert("Access Denied");
      window.location = "/home";
      return;
    }

    axios.get("http://localhost:5000/api/notice").then((res) => setNotices(res.data));
  }, []);

  const addNotice = async () => {
    const token = localStorage.getItem("token");
    await axios.post(
      "http://localhost:5000/api/notice",
      { text: notice },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    window.location.reload();
  };

  return (
    <div className="app-shell">
      <Navbar role={role} />

      <div className="hero">
        <h1>Admin Panel</h1>
        <p>Publish campus-wide notices</p>
      </div>

      <div className="section-card stack">
        <input
          className="input"
          placeholder="Add Notice"
          onChange={(e) => setNotice(e.target.value)}
        />
        <button className="btn" onClick={addNotice}>Add Notice</button>
      </div>

      <div className="grid">
        {notices.map((n) => (
          <div key={n._id} className="section-card">
            <h3 style={{ margin: 0 }}>{n.text}</h3>
            <p style={{ margin: 0, color: "#475569" }}>
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
