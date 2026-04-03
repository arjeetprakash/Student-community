import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Connections() {
  const [activeTab, setActiveTab] = useState("requests");
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [toast, setToast] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    if (userRole !== "student") {
      navigate("/home");
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const [conversationsRes, requestsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/chat-request/conversations", { headers }),
        axios.get("http://localhost:5000/api/chat-request/pending", { headers })
      ]);

      setConnectedUsers(conversationsRes.data);
      setPendingRequests(requestsRes.data);
      setSelectedConversation(null);
      setMessages([]);
    } catch (err) {
      setToast("Error loading requests and connections");
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(
        `http://localhost:5000/api/chat-request/accept/${requestId}`,
        {},
        { headers }
      );
      setToast("Request accepted");
      loadData();
      setActiveTab("connections");
    } catch (err) {
      setToast("Error accepting request");
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(
        `http://localhost:5000/api/chat-request/reject/${requestId}`,
        { headers }
      );
      setToast("Request declined");
      loadData();
    } catch (err) {
      setToast("Error declining request");
    }
  };

  const getOtherUser = (conversation) => {
    return conversation.sender._id === userId
      ? conversation.receiver
      : conversation.sender;
  };

  const loadMessages = async (conversation) => {
    try {
      setMessagesLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const otherUserId =
        conversation.sender._id === userId
          ? conversation.receiver._id
          : conversation.sender._id;

      const res = await axios.get(
        `http://localhost:5000/api/message/${otherUserId}`,
        { headers }
      );

      setMessages(res.data);
      setSelectedConversation(conversation);
      setActiveTab("messages");
    } catch (err) {
      setToast("Error loading messages");
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const otherUserId =
        selectedConversation.sender._id === userId
          ? selectedConversation.receiver._id
          : selectedConversation.sender._id;

      await axios.post(
        "http://localhost:5000/api/message/send",
        { receiverId: otherUserId, text: newMessage },
        { headers }
      );

      setNewMessage("");
      loadMessages(selectedConversation);
      setToast("Message sent!");
      setTimeout(() => setToast(""), 2000);
    } catch (err) {
      setToast("Error sending message");
    }
  };

  const handleSelectConnection = (conversation) => {
    loadMessages(conversation);
  };

  return (
    <div style={{ padding: "24px 0" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ margin: "0 0 8px" }}>Connections & Messages</h1>
        <p style={{ margin: "0", color: "#64748b" }}>
          Manage your connections and chat with students
        </p>
      </div>

      {toast && <div className="toast">{toast}</div>}

      <div className="connections-tabs">
        <button
          className={activeTab === "requests" ? "active" : ""}
          onClick={() => setActiveTab("requests")}
        >
          📥 Requests ({pendingRequests.length})
        </button>
        <button
          className={activeTab === "connections" ? "active" : ""}
          onClick={() => setActiveTab("connections")}
        >
          👥 Connected Friends ({connectedUsers.length})
        </button>
        <button
          className={activeTab === "messages" ? "active" : ""}
          onClick={() => setActiveTab("messages")}
        >
          💬 Messages {selectedConversation && "•"}
        </button>
      </div>

      {activeTab === "requests" && (
        <div className="section-card stack">
          {loading ? (
            <div className="grid">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: "120px" }} />
              ))}
            </div>
          ) : pendingRequests.length > 0 ? (
            <div className="grid msg-request-grid">
              {pendingRequests.map((request) => (
                <div key={request._id} className="section-card msg-request-card">
                  <div className="msg-request-head">
                    <div>
                      <h3>{request.sender?.fullName || "Student"}</h3>
                      <p>{request.sender?.email || ""}</p>
                    </div>
                    <span className="badge pending">Pending</span>
                  </div>

                  <div className="msg-request-meta">
                    <span className="chip">{request.sender?.branch || "N/A"}</span>
                    <span className="chip">{request.sender?.year || "-"}</span>
                  </div>

                  <div className="msg-request-actions">
                    <button className="btn" onClick={() => acceptRequest(request._id)}>
                      Accept
                    </button>
                    <button className="btn secondary" onClick={() => rejectRequest(request._id)}>
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "48px 24px", color: "#94a3b8" }}>
              <p style={{ fontSize: "16px", marginBottom: "12px" }}>No incoming requests.</p>
              <p>When another student sends you a request, it will appear here.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "connections" && (
        <div className="section-card stack">
          {loading ? (
            <div className="grid">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: "120px" }} />
              ))}
            </div>
          ) : connectedUsers.length > 0 ? (
            <div className="connections-grid">
              {connectedUsers.map((conversation) => {
                const otherUser = getOtherUser(conversation);
                return (
                  <div
                    key={conversation._id}
                    className="connection-card"
                    onClick={() => handleSelectConnection(conversation)}
                  >
                    <div className="connection-avatar">
                      {otherUser.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="connection-info">
                      <h3>{otherUser.fullName}</h3>
                      <p>{otherUser.email}</p>
                      <div className="connection-meta">
                        <span className="chip">{otherUser.branch || "N/A"}</span>
                        <span className="chip">{otherUser.year || "-"}</span>
                      </div>
                    </div>
                    <button className="btn secondary">Message →</button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "48px 24px",
                color: "#94a3b8"
              }}
            >
              <p style={{ fontSize: "16px", marginBottom: "12px" }}>
                No connections yet.
              </p>
              <a
                href="#/home/search"
                style={{
                  color: "#0ea5e9",
                  fontWeight: "500",
                  textDecoration: "underline"
                }}
              >
                Find students to connect with →
              </a>
            </div>
          )}
        </div>
      )}

      {activeTab === "messages" && (
        <div className="messages-full-view">
          {selectedConversation ? (
            <>
              <div className="dm-messages-header">
                <div>
                  <h2>{getOtherUser(selectedConversation).fullName}</h2>
                  <p>{getOtherUser(selectedConversation).email}</p>
                </div>
                <button
                  className="btn secondary"
                  onClick={() => {
                    setSelectedConversation(null);
                    setActiveTab("connections");
                  }}
                >
                  ← Back to Connections
                </button>
              </div>

              <div className="dm-messages-container">
                {messagesLoading ? (
                  <div className="stack">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="skeleton"
                        style={{
                          height: "40px",
                          alignSelf: i % 2 === 0 ? "flex-start" : "flex-end",
                          maxWidth: "60%"
                        }}
                      />
                    ))}
                  </div>
                ) : messages.length > 0 ? (
                  <div className="dm-messages-scroll">
                    {messages.map((msg) => {
                      const isSent = msg.sender === userId || msg.sender._id === userId;

                      return (
                        <div
                          key={msg._id}
                          className={`dm-message ${isSent ? "sent" : "received"}`}
                        >
                          <p className="dm-message-text">{msg.text}</p>
                          <small className="dm-message-time">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </small>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "48px 24px",
                      color: "#94a3b8"
                    }}
                  >
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>

              <div className="dm-message-input">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="input"
                />
                <button
                  className="btn"
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="section-card" style={{ textAlign: "center", padding: "64px 24px" }}>
              <p style={{ color: "#94a3b8", fontSize: "16px" }}>
                Select a connection to start messaging
              </p>
              <button
                className="btn secondary"
                onClick={() => setActiveTab("connections")}
                style={{ marginTop: "16px" }}
              >
                View Connections
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
