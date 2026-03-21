import { Link } from "react-router-dom";

export default function Navbar({ role }) {
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    window.location = "/";
  };

  return (
    <div className="navbar">
      <div className="nav-links">
        <strong>CampusConnect</strong>
        <Link to="/home">Home</Link>
        <Link to="/profile">Profile</Link>
        {role === "admin" && <Link to="/admin">Admin</Link>}
      </div>
      <div className="nav-links">
        <div className="badge">{role || "student"}</div>
        <button className="btn secondary" onClick={logout}>Logout</button>
      </div>
    </div>
  );
}
