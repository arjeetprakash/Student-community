import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function MessageRequests() {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("incoming");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    if (userRole !== "student") {
      navigate("/login");
      return;
    }
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [incomingRes, sentRes] = await Promise.all([
        axios.get("http://localhost:5000/api/chat-request/pending", { headers }),
        axios.get("http://localhost:5000/api/chat-request/sent", { headers })
      ]);

      setIncomingRequests(incomingRes.data);
      setSentRequests(sentRes.data);
    } catch (err) {
      setToast("Error loading requests");
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (id) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`http://localhost:5000/api/chat-request/accept/${id}`, {}, { headers });
      setToast("Request accepted!");
      loadRequests();
    } catch (err) {
      setToast("Error accepting request");
    }
  };

  const rejectRequest = async (id) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`http://localhost:5000/api/chat-request/reject/${id}`, { headers });
      setToast("Request rejected");
      loadRequests();
    } catch (err) {
      setToast("Error rejecting request");
    }
  };

  const cancelSentRequest = async (id) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`http://localhost:5000/api/chat-request/reject/${id}`, { headers });
      setToast("Request cancelled");
      loadRequests();
    } catch (err) {
      setToast("Error cancelling request");
    }
  };

  return (
    <div className="app-shell">
      <Navbar role={userRole} />

      <div className="page-hero">
        <h1>Message Requests</h1>
        <p>Manage your direct messaging connections with other students.</p>
      </div>

      {toast && <div className="toast">{toast}</div>}

      <div className="container-main">

        <div className="msg-tabs">
          <button
            className={activeTab === "incoming" ? "active" : ""}
            onClick={() => setActiveTab("incoming")}
          >
            Incoming Requests ({incomingRequests.length})
          </button>
          <button
            className={activeTab === "sent" ? "active" : ""}
            onClick={() => setActiveTab("sent")}
          >
            Sent Requests ({sentRequests.length})
          </button>
        </div>

        {loading ? (
          <div className="grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="section-card skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid msg-request-grid">
            {activeTab === "incoming" && incomingRequests.length > 0 ? (
              incomingRequests.map((req) => (
                <div key={req._id} className="section-card msg-request-card">
                  <div className="msg-request-head">
                    <div>
                      <h3>{req.sender.fullName}</h3>
                      <p>{req.sender.email}</p>
                    </div>
                    <span className="badge">{req.sender.branch}</span>
                  </div>

                  <div className="msg-request-meta">
                    <span className="chip">{req.sender.year || "-"}</span>
                  </div>

                  <div className="msg-request-actions">
                    <button
                      className="btn"
                      onClick={() => acceptRequest(req._id)}
                    >
                      Accept
                    </button>
                    <button
                      className="btn secondary"
                      onClick={() => rejectRequest(req._id)}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            ) : activeTab === "incoming" ? (
              <div className="section-card msg-empty">
                <p>No incoming message requests.</p>
              </div>
            ) : null}

            {activeTab === "sent" && sentRequests.length > 0 ? (
              sentRequests.map((req) => (
                <div key={req._id} className="section-card msg-request-card">
                  <div className="msg-request-head">
                    <div>
                      <h3>{req.receiver.fullName}</h3>
                      <p>{req.receiver.email}</p>
                    </div>
                    <span className="badge pending">Pending</span>
                  </div>

                  <div className="msg-request-meta">
                    <span className="chip">{req.receiver.year || "-"}</span>
                  </div>

                  <div className="msg-request-actions">
                    <button
                      className="btn secondary"
                      onClick={() => cancelSentRequest(req._id)}
                    >
                      Cancel Request
                    </button>
                  </div>
                </div>
              ))
            ) : activeTab === "sent" ? (
              <div className="section-card msg-empty">
                <p>No sent message requests.</p>
              </div>
            ) : null}
          </div>
        )}

      </div>
    </div>
  );
}
