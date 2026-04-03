import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";

export default function Admin() {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [sortBy, setSortBy] = useState("nameAsc");

  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const [notice, setNotice] = useState("");
  const [pinNotice, setPinNotice] = useState(false);
  const [notices, setNotices] = useState([]);
  const [noticesLoading, setNoticesLoading] = useState(false);
  const [noticeSearch, setNoticeSearch] = useState("");

  const [activeTab, setActiveTab] = useState("users");
  const [toast, setToast] = useState("");

  const [page, setPage] = useState(1);
  const usersPerPage = 6;

  useEffect(() => {
    if (!token) {
      window.location.hash = "/";
      return;
    }

    if (role !== "admin") {
      window.location.hash = "/home";
      return;
    }

    loadUsers();
    loadNotices();
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    setPage(1);
  }, [search, branch, year, sortBy]);

  const loadUsers = async () => {
    try {
      setUsersLoading(true);

      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(res.data);
    } catch (err) {
      setToast("Unable to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  const loadNotices = async () => {
    try {
      setNoticesLoading(true);

      const res = await axios.get("http://localhost:5000/api/notice");

      setNotices(res.data);
    } catch (err) {
      setToast("Unable to load notices");
    } finally {
      setNoticesLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    let list = users.filter((u) => {
      const matchesBranch = branch ? (u.branch || "").toLowerCase() === branch.toLowerCase() : true;
      const matchesYear = year ? (u.year || "") === year : true;
      const matchesSearch = query
        ? `${u.fullName || ""} ${u.email || ""}`.toLowerCase().includes(query)
        : true;

      return matchesBranch && matchesYear && matchesSearch;
    });

    if (sortBy === "nameAsc") {
      list = [...list].sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));
    }

    if (sortBy === "nameDesc") {
      list = [...list].sort((a, b) => (b.fullName || "").localeCompare(a.fullName || ""));
    }

    if (sortBy === "recent") {
      list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return list;
  }, [branch, search, sortBy, users, year]);

  const branchOptions = useMemo(() => {
    const uniq = Array.from(new Set(users.map((u) => u.branch).filter(Boolean)));
    return uniq.sort((a, b) => a.localeCompare(b));
  }, [users]);

  const filteredNotices = useMemo(() => {
    const query = noticeSearch.trim().toLowerCase();

    if (!query) {
      return notices;
    }

    return notices.filter((n) => (n.text || "").toLowerCase().includes(query));
  }, [noticeSearch, notices]);

  const stats = useMemo(() => {
    const pinned = notices.filter((n) => n.isPinned).length;
    const totalYears = Array.from(new Set(users.map((u) => u.year).filter(Boolean))).length;

    return {
      totalUsers: users.length,
      visibleUsers: filteredUsers.length,
      totalNotices: notices.length,
      pinnedNotices: pinned,
      totalYears
    };
  }, [filteredUsers.length, notices, users]);

  const topBranch = useMemo(() => {
    const count = {};

    users.forEach((u) => {
      const key = u.branch || "Other";
      count[key] = (count[key] || 0) + 1;
    });

    const entries = Object.entries(count);
    if (!entries.length) return "-";

    return entries.sort((a, b) => b[1] - a[1])[0][0];
  }, [users]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const lastIndex = page * usersPerPage;
  const firstIndex = lastIndex - usersPerPage;
  const currentUsers = filteredUsers.slice(firstIndex, lastIndex);

  const sendMessage = async () => {
    if (!selectedUser || !message.trim()) {
      return;
    }

    try {
      setSendingMessage(true);

      await axios.post(
        "http://localhost:5000/api/message/send",
        {
          receiverId: selectedUser._id,
          text: message
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage("");
      setToast("Message sent");
    } catch (err) {
      setToast("Unable to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const addNotice = async () => {
    if (!notice.trim()) {
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/notice",
        {
          text: notice,
          isPinned: String(pinNotice)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setNotice("");
      setPinNotice(false);
      setToast("Notice published");
      loadNotices();
    } catch (err) {
      setToast("Unable to publish notice");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setBranch("");
    setYear("");
    setSortBy("nameAsc");
  };

  const quickMessage = (text) => {
    setMessage(text);
  };

  const exportUsersCsv = () => {
    if (!filteredUsers.length) {
      setToast("No users to export");
      return;
    }

    const header = ["Full Name", "Email", "College", "Branch", "Year"];
    const rows = filteredUsers.map((u) =>
      [
        `"${(u.fullName || "").replaceAll('"', '""')}"`,
        `"${(u.email || "").replaceAll('"', '""')}"`,
        `"${(u.college || "").replaceAll('"', '""')}"`,
        `"${(u.branch || "").replaceAll('"', '""')}"`,
        `"${(u.year || "").replaceAll('"', '""')}"`
      ].join(",")
    );

    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "studenthub-users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToast("CSV exported");
  };

  return (
    <div className="app-shell admin-page">
      <Navbar role={role} />

      <div className="admin-hero">
        <div>
          <h1>Admin Command Center</h1>
          <p>Monitor community growth, engage students, and publish important updates.</p>
        </div>
        <div className="admin-hero-actions">
          <button className="btn secondary" onClick={loadUsers}>Refresh Users</button>
          <button className="btn secondary" onClick={loadNotices}>Refresh Notices</button>
          <button className="btn" onClick={exportUsersCsv}>Export CSV</button>
        </div>
      </div>

      {!!toast && <div className="toast">{toast}</div>}

      <div className="admin-stats-grid">
        <article className="admin-stat-card">
          <p>Total Students</p>
          <h3>{stats.totalUsers}</h3>
        </article>
        <article className="admin-stat-card">
          <p>Visible by Filters</p>
          <h3>{stats.visibleUsers}</h3>
        </article>
        <article className="admin-stat-card">
          <p>Total Notices</p>
          <h3>{stats.totalNotices}</h3>
        </article>
        <article className="admin-stat-card">
          <p>Pinned Notices</p>
          <h3>{stats.pinnedNotices}</h3>
        </article>
        <article className="admin-stat-card">
          <p>Top Branch</p>
          <h3>{topBranch}</h3>
        </article>
        <article className="admin-stat-card">
          <p>Active Years</p>
          <h3>{stats.totalYears}</h3>
        </article>
      </div>

      <div className="admin-tab-row">
        <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>Users</button>
        <button className={activeTab === "notices" ? "active" : ""} onClick={() => setActiveTab("notices")}>Notices</button>
      </div>

      {activeTab === "users" && (
        <div className="tab-content">
          <div className="section-card stack">
            <div className="admin-filter-grid">
              <input
                className="input"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select className="input" value={branch} onChange={(e) => setBranch(e.target.value)}>
                <option value="">All Branches</option>
                {branchOptions.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>

              <select className="input" value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">All Years</option>
                <option>1st</option>
                <option>2nd</option>
                <option>3rd</option>
                <option>4th</option>
              </select>

              <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="nameAsc">Sort: Name A-Z</option>
                <option value="nameDesc">Sort: Name Z-A</option>
                <option value="recent">Sort: Recently Joined</option>
              </select>
            </div>

            <div className="admin-inline-actions">
              <button className="btn secondary" onClick={clearFilters}>Reset Filters</button>
              <span className="chip subtle">{filteredUsers.length} matching users</span>
            </div>
          </div>

          {usersLoading ? (
            <div className="grid">
              {Array.from({ length: 4 }).map((_, idx) => <div key={idx} className="section-card skeleton" />)}
            </div>
          ) : (
            <div className="admin-layout-split">
              <div>
                <div className="grid admin-user-grid">
                  {currentUsers.map((u) => (
                    <div
                      key={u._id}
                      className={`section-card admin-user-card ${selectedUser?._id === u._id ? "selected" : ""}`}
                      onClick={() => setSelectedUser(u)}
                    >
                      <h3>{u.fullName}</h3>
                      <p>{u.email}</p>
                      <div className="admin-user-meta">
                        <span className="badge">{u.branch || "N/A"}</span>
                        <span className="chip">{u.year || "-"}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="admin-pager">
                  <button className="btn secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
                  <span>Page {page} / {totalPages || 1}</span>
                  <button className="btn secondary" disabled={page >= (totalPages || 1)} onClick={() => setPage(page + 1)}>Next</button>
                </div>
              </div>

              <div className="section-card admin-detail-card stack">
                <h2>{selectedUser ? "Student Spotlight" : "Select a Student"}</h2>
                {selectedUser ? (
                  <>
                    <div className="admin-detail-list stack">
                      <p><strong>Name:</strong> {selectedUser.fullName}</p>
                      <p><strong>Email:</strong> {selectedUser.email}</p>
                      <p><strong>College:</strong> {selectedUser.college || "-"}</p>
                      <p><strong>Branch:</strong> {selectedUser.branch || "-"}</p>
                      <p><strong>Year:</strong> {selectedUser.year || "-"}</p>
                    </div>

                    <div className="admin-quick-messages">
                      <button onClick={() => quickMessage("Please check the latest notice and confirm receipt.")}>Ask Notice Confirmation</button>
                      <button onClick={() => quickMessage("Your profile is incomplete. Please update it today.")}>Profile Completion Reminder</button>
                      <button onClick={() => quickMessage("You have been selected for a student volunteer activity.")}>Volunteer Invite</button>
                    </div>

                    <textarea
                      className="input"
                      placeholder="Write a direct message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                    />

                    <button className="btn" onClick={sendMessage} disabled={sendingMessage || !message.trim()}>
                      {sendingMessage ? "Sending..." : "Send Message"}
                    </button>
                  </>
                ) : (
                  <p className="admin-empty-text">Pick a user card to see details and send a direct message.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "notices" && (
        <div className="tab-content">
          <div className="section-card stack">
            <textarea
              className="input"
              placeholder="Write an official notice for all students"
              value={notice}
              onChange={(e) => setNotice(e.target.value)}
              rows={3}
            />

            <div className="admin-inline-actions">
              <label className="admin-toggle">
                <input type="checkbox" checked={pinNotice} onChange={(e) => setPinNotice(e.target.checked)} />
                <span>Pin this notice</span>
              </label>
              <button className="btn" onClick={addNotice} disabled={!notice.trim()}>Publish Notice</button>
            </div>
          </div>

          <div className="section-card stack">
            <input
              className="input"
              placeholder="Search in notices"
              value={noticeSearch}
              onChange={(e) => setNoticeSearch(e.target.value)}
            />

            {noticesLoading ? (
              <div className="grid">
                {Array.from({ length: 4 }).map((_, idx) => <div key={idx} className="section-card skeleton" />)}
              </div>
            ) : (
              <div className="grid admin-notice-grid">
                {filteredNotices.map((n) => (
                  <div key={n._id} className="section-card admin-notice-card">
                    <div className="admin-notice-head">
                      {n.isPinned && <span className="pin">Pinned</span>}
                      <small>{new Date(n.createdAt).toLocaleString()}</small>
                    </div>
                    <p>{n.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
