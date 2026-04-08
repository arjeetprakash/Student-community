import { useState } from "react";
import { Link } from "react-router-dom";
import NotificationsPanel from "./NotificationsPanel";

export default function Navbar({ role }) {
      const [showMenu, setShowMenu] = useState(false);

      const logout = () => {
            localStorage.clear();
            window.location.hash = "/";
      };

      return (
            <nav className="navbar navbar-premium">
                  <div className="navbar-brand-block">
                        <strong className="navbar-brand">CampusConnect</strong>
                        <small>Student community network</small>
                  </div>

                  <div className="nav-links nav-links-main">
                        <Link to="/home">Home</Link>
                        <Link to="/home/notices">Notices</Link>
                        <Link to="/home/search">Search</Link>
                        {role === "student" && <Link to="/home/connections">Connections</Link>}
                  </div>

                  <div className="nav-links nav-links-end">
                        <NotificationsPanel />
                        <div className="badge">{role}</div>

                        <div className="profile-menu-wrap">
                              <button
                                    type="button"
                                    onClick={() => setShowMenu((current) => !current)}
                                    className="btn secondary profile-menu-btn"
                              >
                                    Profile
                              </button>

                              {showMenu && (
                                    <div className="profile-menu-popover">
                                          <Link to="/home/profile" onClick={() => setShowMenu(false)}>
                                                View Profile
                                          </Link>
                                          <Link to="/home/profile/edit" onClick={() => setShowMenu(false)}>
                                                Edit Profile
                                          </Link>
                                    </div>
                              )}
                        </div>

                        <button type="button" className="btn secondary" onClick={logout}>
                              Logout
                        </button>
                  </div>
            </nav>
      );
}