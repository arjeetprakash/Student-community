import axios from "axios";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function HomePage() {

  const [notices, setNotices] = useState([]);
  const role = localStorage.getItem("role");

  useEffect(() => {
    axios.get("http://localhost:5000/api/notice")
      .then(res => setNotices(res.data))
      .catch(()=>setNotices([]));
  }, []);

  return (
    <div className="app-shell">

      <Navbar role={role} />

      <div className="hero">
        <h1>Community Updates</h1>
        <p>Latest announcements from admin</p>
      </div>

      <div className="grid">
        {notices.map(n => (
          <div key={n._id} className="section-card">
            <h3>{n.text}</h3>
            <small>
              {new Date(n.createdAt).toLocaleString()}
            </small>
          </div>
        ))}
      </div>

    </div>
  );
}