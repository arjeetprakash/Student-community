import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar({ role }) {
      const [showMenu, setShowMenu] = useState(false);

      const logout = () => {
            localStorage.clear();
            window.location.href = "/";
      };

      return (
            <nav className="navbar">
                  <div className="nav-links">
                        <strong>CampusConnect</strong>
                        <Link to="/home">Home</Link>
                        <Link to="/home/notices">Notices</Link>
                        <Link to="/home/search">Search</Link>
                        {role === "student" && <Link to="/home/connections">Connections & Messages</Link>}

                        <div style={{ position: "relative" }}>
                              <button
                                    type="button"
                                    onClick={() => setShowMenu((current) => !current)}
                                    className="btn secondary"
                              >
                                    Profile ▼
                              </button>

                              {showMenu && (
                                    <div
                                          style={{
                                                position: "absolute",
                                                top: "calc(100% + 8px)",
                                                left: 0,
                                                background: "#fff",
                                                borderRadius: "8px",
                                                padding: "8px",
                                                boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                                                display: "flex",
                                                flexDirection: "column",
                                                minWidth: "150px",
                                                zIndex: 1000,
                                                gap: "8px",
                                          }}
                                    >
                                          <Link to="/home/profile" onClick={() => setShowMenu(false)}>
                                                View Profile
                                          </Link>
                                          <Link to="/home/profile/edit" onClick={() => setShowMenu(false)}>
                                                Edit Profile
                                          </Link>
                                    </div>
                              )}
                        </div>
                  </div>

                  <div className="nav-links">
                        <div className="badge">{role}</div>
                        <button type="button" className="btn secondary" onClick={logout}>
                              Logout
                        </button>
                  </div>
            </nav>
      );
}