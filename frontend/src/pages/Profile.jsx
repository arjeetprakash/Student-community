import axios from "axios";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function Profile() {

  const [user, setUser] = useState({});
  const role = localStorage.getItem("role");

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      window.location = "/";
      return;
    }

    axios.get("http://localhost:5000/api/auth/me", {

      headers: {
        Authorization: `Bearer ${token}`
      }

    })
    .then(res => setUser(res.data))
    .catch(err => console.log(err));

  }, []);

  return (

    <div className="app-shell">

      <Navbar role={role} />

      <div className="hero">
        <h1>My Profile</h1>
        <p>Your account details</p>
      </div>

      <div className="section-card stack">

        <div>
          <strong>Name:</strong> {user.username || "Loading..."}
        </div>

        <div>
          <strong>Email:</strong> {user.email || "Loading..."}
        </div>

        <div>
          <strong>Role:</strong> {user.role || role}
        </div>

      </div>

    </div>

  );
}