import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { connectChatSocket, disconnectChatSocket } from "../lib/chatSocket";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../lib/apiBase";

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
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [pinnedConversations, setPinnedConversations] = useState(
    JSON.parse(localStorage.getItem("pinnedConversations") || "[]")
  );
  const [mutedConversations, setMutedConversations] = useState(
    JSON.parse(localStorage.getItem("mutedConversations") || "[]")
  );
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [connectionSearch, setConnectionSearch] = useState("");
  const [requestSearch, setRequestSearch] = useState("");
  const [connectionSort, setConnectionSort] = useState("priority");
  const [inboxUnreadOnly, setInboxUnreadOnly] = useState(false);
  const [messageSearch, setMessageSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const selectedConversationRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("role");

  const getConversationUserId = (conversation) =>
    String(conversation.sender._id) === String(userId)
      ? String(conversation.receiver._id)
      : String(conversation.sender._id);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (userRole !== "student") {
      navigate("/home");
      return;
    }
    loadData();
  }, []);

  useEffect(() => {
    const socket = connectChatSocket(token);

    if (!socket) {
      return undefined;
    }

    const handleIncomingMessage = (message) => {
      if (String(message.sender) === String(userId)) {
        return;
      }

      const senderId = String(message.sender);
      const activeConversationUserId = selectedConversationRef.current
        ? getConversationUserId(selectedConversationRef.current)
        : null;

      setConnectedUsers((current) =>
        current.map((conversation) => {
          if (getConversationUserId(conversation) !== senderId) {
            return conversation;
          }

          const isOpenConversation =
            selectedConversationRef.current &&
            String(conversation._id) === String(selectedConversationRef.current._id);

          return {
            ...conversation,
            unreadCount: isOpenConversation ? 0 : (conversation.unreadCount || 0) + 1
          };
        })
      );

      if (activeConversationUserId === senderId) {
        setMessages((current) => {
          if (current.some((item) => item._id === message._id)) {
            return current;
          }

          return [...current, message];
        });

        socket.emit("conversation:opened", { otherUserId: senderId });
      } else {
        setUnreadCount((current) => current + 1);
      }
    };

    const handleConversationRead = ({ otherUserId, clearedCount = 0 }) => {
      setConnectedUsers((current) =>
        current.map((conversation) => {
          if (getConversationUserId(conversation) !== String(otherUserId)) {
            return conversation;
          }

          return { ...conversation, unreadCount: 0 };
        })
      );

      if (clearedCount > 0) {
        setUnreadCount((current) => Math.max(current - clearedCount, 0));
      }
    };

    const handleUserTyping = ({ userId: typingUserId }) => {
      setTypingUsers((current) => ({
        ...current,
        [typingUserId]: true
      }));
    };

    const handleUserStoppedTyping = ({ userId: typingUserId }) => {
      setTypingUsers((current) => {
        const updated = { ...current };
        delete updated[typingUserId];
        return updated;
      });
    };

    const handleUserOnline = ({ userId: onlineUserId }) => {
      setOnlineUsers((current) => {
        if (!current.includes(onlineUserId)) {
          return [...current, onlineUserId];
        }
        return current;
      });
    };

    const handleUserOffline = ({ userId: offlineUserId }) => {
      setOnlineUsers((current) => current.filter((id) => id !== offlineUserId));
    };

    socket.on("message:new", handleIncomingMessage);
    socket.on("conversation:read", handleConversationRead);
    socket.on("user:typing", handleUserTyping);
    socket.on("user:stopped-typing", handleUserStoppedTyping);
    socket.on("user:online", handleUserOnline);
    socket.on("user:offline", handleUserOffline);

    return () => {
      socket.off("message:new", handleIncomingMessage);
      socket.off("conversation:read", handleConversationRead);
      socket.off("user:typing", handleUserTyping);
      socket.off("user:stopped-typing", handleUserStoppedTyping);
      socket.off("user:online", handleUserOnline);
      socket.off("user:offline", handleUserOffline);
      disconnectChatSocket();
    };
  }, [token, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  const loadData = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const headers = { Authorization: `Bearer ${token}` };
      const [conversationsRes, requestsRes, onlineRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/chat-request/conversations`, { headers }),
        axios.get(`${API_BASE_URL}/api/chat-request/pending`, { headers }),
        axios.get(`${API_BASE_URL}/api/users/online`)
      ]);

      setConnectedUsers(conversationsRes.data);
      setPendingRequests(requestsRes.data);
      setOnlineUsers(onlineRes.data.onlineUsers || []);
      setUnreadCount(
        conversationsRes.data.reduce((sum, conversation) => sum + (conversation.unreadCount || 0), 0)
      );
      if (!silent) {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (err) {
      if (!silent) {
        setToast("Unable to load connections. Please check backend server and try refresh.");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(
        `${API_BASE_URL}/api/chat-request/accept/${requestId}`,
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
        `${API_BASE_URL}/api/chat-request/reject/${requestId}`,
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
        `${API_BASE_URL}/api/message/${otherUserId}`,
        { headers }
      );

      setMessages(res.data);
      setSelectedConversation(conversation);
      setActiveTab("messages");

      const socket = connectChatSocket(token);
      socket?.emit("conversation:opened", {
        otherUserId
      });
    } catch (err) {
      setToast("Error loading messages");
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;

    if (!selectedConversation) {
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const otherUserId =
        selectedConversation.sender._id === userId
          ? selectedConversation.receiver._id
          : selectedConversation.sender._id;

      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        sender: userId,
        receiver: otherUserId,
        text: newMessage,
        attachment: selectedFile
          ? {
              originalName: selectedFile.name,
              mimetype: selectedFile.type,
              size: selectedFile.size
            }
          : null,
        createdAt: new Date().toISOString(),
        pending: true
      };

      setMessages((current) => [...current, optimisticMessage]);
      const messageText = newMessage;
      setNewMessage("");
      setSelectedFile(null);

      const payload = new FormData();
      payload.append("receiverId", otherUserId);
      payload.append("text", messageText);
      if (selectedFile) {
        payload.append("file", selectedFile);
      }

      const res = await axios.post(`${API_BASE_URL}/api/message/send`, payload, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data"
        }
      });

      setMessages((current) =>
        current.map((item) => (item._id === optimisticMessage._id ? res.data : item))
      );
      setToast("Message sent!");
    } catch (err) {
      setMessages((current) => current.filter((item) => !item.pending));
      setNewMessage("");
      setToast("Error sending message");
    }
  };

  const handleSelectConnection = (conversation) => {
    loadMessages(conversation);
  };

  const handleTypingInput = (e) => {
    setNewMessage(e.target.value);

    if (!selectedConversation) return;

    const socket = connectChatSocket(token);
    if (!socket) return;

    const otherUserId =
      selectedConversation.sender._id === userId
        ? selectedConversation.receiver._id
        : selectedConversation.sender._id;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("user:typing", { otherUserId });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit("user:stopped-typing", { otherUserId });
    }, 2000);
  };

  const visibleMessages = useMemo(() => {
    const q = messageSearch.trim().toLowerCase();
    if (!q) {
      return messages;
    }

    return messages.filter((msg) => {
      const text = String(msg.text || "").toLowerCase();
      const fileName = String(msg.attachment?.originalName || "").toLowerCase();
      return text.includes(q) || fileName.includes(q);
    });
  }, [messages, messageSearch]);

  const inboxConnections = useMemo(() => {
    if (!inboxUnreadOnly) {
      return effectiveConnections;
    }

    return effectiveConnections.filter((conversation) => (conversation.unreadCount || 0) > 0);
  }, [effectiveConnections, inboxUnreadOnly]);

  const pinnedInboxConnections = useMemo(
    () => inboxConnections.filter((conversation) => pinnedConversations.includes(conversation._id)),
    [inboxConnections, pinnedConversations]
  );

  const otherInboxConnections = useMemo(
    () => inboxConnections.filter((conversation) => !pinnedConversations.includes(conversation._id)),
    [inboxConnections, pinnedConversations]
  );

  const formatLastActive = (lastMessage) => {
    if (!lastMessage?.createdAt) return "";
    const time = new Date(lastMessage.createdAt);
    const now = new Date();
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  };

  const togglePinConversation = (conversationId, e) => {
    e.stopPropagation();
    const isPinned = pinnedConversations.includes(conversationId);
    const updated = isPinned
      ? pinnedConversations.filter((id) => id !== conversationId)
      : [...pinnedConversations, conversationId];
    setPinnedConversations(updated);
    localStorage.setItem("pinnedConversations", JSON.stringify(updated));
    setToast(isPinned ? "Unpinned conversation" : "Conversation pinned");
    setOpenActionMenu(null);
  };

  const toggleMuteConversation = (conversationId, e) => {
    e.stopPropagation();
    const isMuted = mutedConversations.includes(conversationId);
    const updated = isMuted
      ? mutedConversations.filter((id) => id !== conversationId)
      : [...mutedConversations, conversationId];
    setMutedConversations(updated);
    localStorage.setItem("mutedConversations", JSON.stringify(updated));
    setToast(isMuted ? "Notifications enabled" : "Notifications muted");
    setOpenActionMenu(null);
  };

  const deleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this conversation?")) {
      return;
    }
    try {
      // Just remove from local view (no backend endpoint, but you can add one)
      setConnectedUsers((current) =>
        current.filter((conv) => conv._id !== conversationId)
      );
      setToast("Conversation deleted");
      setOpenActionMenu(null);
      if (selectedConversation?._id === conversationId) {
        setSelectedConversation(null);
        setActiveTab("connections");
      }
    } catch (err) {
      setToast("Error deleting conversation");
    }
  };

  const filteredRequests = useMemo(() => {
    const q = requestSearch.trim().toLowerCase();
    if (!q) {
      return pendingRequests;
    }

    return pendingRequests.filter((request) => {
      const fullName = request.sender?.fullName?.toLowerCase() || "";
      const email = request.sender?.email?.toLowerCase() || "";
      const branch = request.sender?.branch?.toLowerCase() || "";
      return fullName.includes(q) || email.includes(q) || branch.includes(q);
    });
  }, [pendingRequests, requestSearch]);

  const effectiveConnections = useMemo(() => {
    const q = connectionSearch.trim().toLowerCase();

    let working = connectedUsers.filter((conversation) => {
      const user = getOtherUser(conversation);
      if (!q) {
        return true;
      }

      return (
        user.fullName?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.branch?.toLowerCase().includes(q)
      );
    });

    working = [...working].sort((a, b) => {
      const aOther = getOtherUser(a);
      const bOther = getOtherUser(b);
      const aPinned = pinnedConversations.includes(a._id);
      const bPinned = pinnedConversations.includes(b._id);
      const aOnline = onlineUsers.includes(String(aOther._id));
      const bOnline = onlineUsers.includes(String(bOther._id));
      const aUnread = a.unreadCount || 0;
      const bUnread = b.unreadCount || 0;
      const aTime = new Date(a.lastMessage?.createdAt || a.updatedAt || 0).getTime();
      const bTime = new Date(b.lastMessage?.createdAt || b.updatedAt || 0).getTime();

      if (connectionSort === "recent") {
        return bTime - aTime;
      }
      if (connectionSort === "online") {
        if (aOnline !== bOnline) return aOnline ? -1 : 1;
        return bTime - aTime;
      }

      if (aPinned !== bPinned) return aPinned ? -1 : 1;
      if (aUnread !== bUnread) return bUnread - aUnread;
      if (aOnline !== bOnline) return aOnline ? -1 : 1;
      return bTime - aTime;
    });

    return working;
  }, [connectedUsers, connectionSearch, connectionSort, pinnedConversations, onlineUsers]);

  const quickStats = useMemo(() => {
    const onlineConnections = connectedUsers.filter((conversation) => {
      const user = getOtherUser(conversation);
      return onlineUsers.includes(String(user._id));
    }).length;

    return {
      pending: pendingRequests.length,
      totalConnections: connectedUsers.length,
      onlineConnections,
      unread: unreadCount
    };
  }, [connectedUsers, pendingRequests, onlineUsers, unreadCount]);

  return (
    <div className="app-shell connections-page">
      <Navbar role={userRole} />

      <div className="connections-hero">
        <div>
          <h1>Connections & Messages</h1>
          <p>Manage requests, prioritize conversations, and keep chats flowing.</p>
        </div>
        <button className="btn secondary" onClick={() => loadData({ silent: true })}>Refresh live data</button>
      </div>

      <div className="connections-stats-grid">
        <article className="connections-stat-card">
          <small>Pending Requests</small>
          <h3>{quickStats.pending}</h3>
        </article>
        <article className="connections-stat-card">
          <small>Total Connections</small>
          <h3>{quickStats.totalConnections}</h3>
        </article>
        <article className="connections-stat-card">
          <small>Online Now</small>
          <h3>{quickStats.onlineConnections}</h3>
        </article>
        <article className="connections-stat-card">
          <small>Unread Messages</small>
          <h3>{quickStats.unread}</h3>
        </article>
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
          💬 Messages
          {unreadCount > 0 && (
            <span className={`tab-badge ${unreadCount > 0 ? "pulse" : ""}`}>
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === "requests" && (
        <div className="section-card stack">
          <input
            className="input"
            placeholder="Search pending requests by name, email, or branch"
            value={requestSearch}
            onChange={(e) => setRequestSearch(e.target.value)}
          />

          {loading ? (
            <div className="grid">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: "120px" }} />
              ))}
            </div>
          ) : filteredRequests.length > 0 ? (
            <div className="grid msg-request-grid">
              {filteredRequests.map((request) => (
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
            <div
              style={{
                textAlign: "center",
                padding: "64px 24px",
                color: "#94a3b8"
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
              <p style={{ fontSize: "18px", fontWeight: "500", marginBottom: "8px", color: "#475569" }}>
                No incoming requests yet.
              </p>
              <p style={{ fontSize: "14px", marginBottom: "20px" }}>
                When another student sends you a request, it will appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "connections" && (
        <div className="section-card stack">
          <div className="connections-filter-row">
            <input
              className="input"
              placeholder="Search connections"
              value={connectionSearch}
              onChange={(e) => setConnectionSearch(e.target.value)}
            />
            <select
              className="input"
              value={connectionSort}
              onChange={(e) => setConnectionSort(e.target.value)}
              style={{ maxWidth: 220 }}
            >
              <option value="priority">Sort: Priority</option>
              <option value="recent">Sort: Recently Active</option>
              <option value="online">Sort: Online First</option>
            </select>
          </div>

          {loading ? (
            <div className="grid">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: "120px" }} />
              ))}
            </div>
          ) : effectiveConnections.length > 0 ? (
            <div className="connections-grid">
              {effectiveConnections.map((conversation) => {
                const otherUser = getOtherUser(conversation);
                const isOtherUserOnline = onlineUsers.includes(String(otherUser._id));
                const isTyping = typingUsers[String(otherUser._id)];
                const isPinned = pinnedConversations.includes(conversation._id);
                const isMuted = mutedConversations.includes(conversation._id);
                return (
                  <div
                    key={conversation._id}
                    className="connection-card"
                    onClick={() => handleSelectConnection(conversation)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelectConnection(conversation);
                      }
                    }}
                    aria-label={`Chat with ${otherUser.fullName}`}
                  >
                    <div className="connection-avatar-wrapper">
                      <div className="connection-avatar">
                        {otherUser.fullName.charAt(0).toUpperCase()}
                      </div>
                      {isOtherUserOnline && <div className="status-indicator online"></div>}
                      {!isOtherUserOnline && <div className="status-indicator offline"></div>}
                    </div>
                    <div className="connection-info">
                      <div className="connection-header-row">
                        <h3>{otherUser.fullName}</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {isPinned && <span className="chip subtle">Pinned</span>}
                          {isMuted && <span className="chip">Muted</span>}
                        </div>
                        {conversation.unreadCount > 0 && (
                          <span className="unread-badge">{conversation.unreadCount}</span>
                        )}
                      </div>
                      <p className="connection-status">
                        {isTyping ? (
                          <span className="typing-text">typing...</span>
                        ) : isOtherUserOnline ? (
                          <span className="online-text">Online</span>
                        ) : (
                          <span className="offline-text">Last active {formatLastActive(conversation.lastMessage)}</span>
                        )}
                      </p>
                      <div className="connection-meta">
                        <span className="chip">{otherUser.branch || "N/A"}</span>
                        <span className="chip">{otherUser.year || "-"}</span>
                      </div>
                    </div>
                    {conversation.lastMessage && (
                      <div className="connection-last-msg">
                        <small>
                          {conversation.lastMessage.sender === userId ? "You: " : ""}
                          {conversation.lastMessage.text.length > 40
                            ? conversation.lastMessage.text.substring(0, 40) + "..."
                            : conversation.lastMessage.text}
                        </small>
                        <span className="connection-msg-time">
                          {new Date(conversation.lastMessage.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                    <div className="connection-menu">
                      <button
                        className="connection-menu-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionMenu(openActionMenu === conversation._id ? null : conversation._id);
                        }}
                        title="More options"
                      >
                        ⋯
                      </button>
                      {openActionMenu === conversation._id && (
                        <div className="connection-action-menu">
                          <button
                            className="action-item"
                            onClick={(e) => togglePinConversation(conversation._id, e)}
                          >
                            {pinnedConversations.includes(conversation._id) ? "📌 Unpin" : "📍 Pin"}
                          </button>
                          <button
                            className="action-item"
                            onClick={(e) => toggleMuteConversation(conversation._id, e)}
                          >
                            {mutedConversations.includes(conversation._id) ? "🔔 Unmute" : "🔕 Mute"}
                          </button>
                          <button
                            className="action-item delete"
                            onClick={(e) => deleteConversation(conversation._id, e)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "64px 24px",
                color: "#94a3b8"
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>👥</div>
              <p style={{ fontSize: "18px", fontWeight: "500", marginBottom: "8px", color: "#475569" }}>
                No connections yet.
              </p>
              <p style={{ fontSize: "14px", marginBottom: "20px" }}>
                Start connecting with other students to begin chatting!
              </p>
              <a
                href="#/home/search"
                style={{
                  display: "inline-block",
                  color: "white",
                  background: "#0ea5e9",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: "500",
                  textDecoration: "none",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) => e.target.style.background = "#0284c7"}
                onMouseLeave={(e) => e.target.style.background = "#0ea5e9"}
              >
                Search & Connect 🔍
              </a>
            </div>
          )}
        </div>
      )}

      {activeTab === "messages" && (
        <div className="messages-full-view inbox-layout">
          <aside className="section-card inbox-sidebar">
            <div className="inbox-sidebar-head">
              <h3>Inbox</h3>
              <span className="chip subtle">{inboxConnections.length}</span>
            </div>

            <input
              className="input"
              placeholder="Search inbox"
              value={connectionSearch}
              onChange={(e) => setConnectionSearch(e.target.value)}
            />

            <label className="inbox-unread-toggle">
              <input
                type="checkbox"
                checked={inboxUnreadOnly}
                onChange={(e) => setInboxUnreadOnly(e.target.checked)}
              />
              Unread only
            </label>

            <div className="inbox-list">
              {inboxConnections.length === 0 && (
                <p className="inbox-empty">No conversations found.</p>
              )}

              {!!pinnedInboxConnections.length && <p className="inbox-group-title">Pinned</p>}

              {pinnedInboxConnections.map((conversation) => {
                const otherUser = getOtherUser(conversation);
                const isOtherUserOnline = onlineUsers.includes(String(otherUser._id));
                const isActive = selectedConversation?._id === conversation._id;

                return (
                  <button
                    key={conversation._id}
                    type="button"
                    className={`inbox-item ${isActive ? "active" : ""}`}
                    onClick={() => handleSelectConnection(conversation)}
                  >
                    <div className="inbox-item-top">
                      <strong>{otherUser.fullName}</strong>
                      {conversation.unreadCount > 0 && (
                        <span className="unread-badge">{conversation.unreadCount}</span>
                      )}
                    </div>
                    <small>
                      {conversation.lastMessage?.text
                        ? `${conversation.lastMessage.sender === userId ? "You: " : ""}${conversation.lastMessage.text.slice(0, 34)}`
                        : "No messages yet"}
                    </small>
                    <span className={`inbox-presence ${isOtherUserOnline ? "online" : "offline"}`}>
                      {isOtherUserOnline ? "Online" : "Offline"}
                    </span>
                  </button>
                );
              })}

              {!!otherInboxConnections.length && <p className="inbox-group-title">All Conversations</p>}

              {otherInboxConnections.map((conversation) => {
                const otherUser = getOtherUser(conversation);
                const isOtherUserOnline = onlineUsers.includes(String(otherUser._id));
                const isActive = selectedConversation?._id === conversation._id;

                return (
                  <button
                    key={conversation._id}
                    type="button"
                    className={`inbox-item ${isActive ? "active" : ""}`}
                    onClick={() => handleSelectConnection(conversation)}
                  >
                    <div className="inbox-item-top">
                      <strong>{otherUser.fullName}</strong>
                      {conversation.unreadCount > 0 && (
                        <span className="unread-badge">{conversation.unreadCount}</span>
                      )}
                    </div>
                    <small>
                      {conversation.lastMessage?.text
                        ? `${conversation.lastMessage.sender === userId ? "You: " : ""}${conversation.lastMessage.text.slice(0, 34)}`
                        : "No messages yet"}
                    </small>
                    <span className={`inbox-presence ${isOtherUserOnline ? "online" : "offline"}`}>
                      {isOtherUserOnline ? "Online" : "Offline"}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="section-card inbox-chat">
            {selectedConversation ? (
              <>
                <div className="dm-messages-header">
                  <div>
                    <h2>{getOtherUser(selectedConversation).fullName}</h2>
                    <p>{getOtherUser(selectedConversation).email}</p>
                  </div>
                  <input
                    className="input"
                    style={{ maxWidth: "260px" }}
                    placeholder="Search in conversation"
                    value={messageSearch}
                    onChange={(e) => setMessageSearch(e.target.value)}
                  />
                  <button
                    className="btn secondary"
                    onClick={() => {
                      setSelectedConversation(null);
                    }}
                  >
                    Clear Selection
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
                  ) : visibleMessages.length > 0 ? (
                    <div className="dm-messages-scroll">
                      {visibleMessages.map((msg) => {
                        const isSent = msg.sender === userId || msg.sender._id === userId;
                        const hasAttachment = Boolean(msg.attachment?.filename || msg.attachment?.originalName);
                        const fileName = msg.attachment?.originalName || "Attachment";
                        const fileUrl = msg.attachment?.filename
                          ? `${API_BASE_URL}/uploads/${msg.attachment.filename}`
                          : null;
                        const isImage = String(msg.attachment?.mimetype || "").startsWith("image/");

                        return (
                          <div
                            key={msg._id}
                            className={`dm-message ${isSent ? "sent" : "received"} ${msg.pending ? "pending" : ""}`}
                          >
                            <p className="dm-message-text">{msg.text}</p>
                            {hasAttachment && (
                              <div className="dm-attachment-wrap">
                                {fileUrl && isImage ? (
                                  <a href={fileUrl} target="_blank" rel="noreferrer">
                                    <img src={fileUrl} alt={fileName} className="dm-attachment-image" />
                                  </a>
                                ) : (
                                  <a
                                    href={fileUrl || "#"}
                                    target={fileUrl ? "_blank" : undefined}
                                    rel={fileUrl ? "noreferrer" : undefined}
                                    className="dm-attachment-link"
                                  >
                                    {fileName}
                                  </a>
                                )}
                              </div>
                            )}
                            <div className="dm-message-footer">
                              <small className="dm-message-time">
                                {msg.pending ? "Sending..." : new Date(msg.createdAt).toLocaleTimeString()}
                              </small>
                              {isSent && (
                                <span className={`read-receipt ${msg.readByReceiver ? "read" : "sent"}`}>
                                  {msg.readByReceiver ? "✓✓" : "✓"}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {selectedConversation && typingUsers[String(getOtherUser(selectedConversation)._id)] && (
                        <div className="dm-message received typing-indicator">
                          <div className="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "64px 24px",
                        color: "#94a3b8"
                      }}
                    >
                      <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
                      <p style={{ fontSize: "18px", fontWeight: "500", marginBottom: "8px", color: "#475569" }}>
                        No messages yet.
                      </p>
                      <p style={{ fontSize: "14px" }}>Say hello and start the conversation!</p>
                    </div>
                  )}
                </div>

                <div className="dm-message-input">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={handleTypingInput}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    className="input"
                  />
                  <label className="dm-attach-btn">
                    Attach
                    <input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  <button
                    className="btn"
                    onClick={sendMessage}
                    disabled={!newMessage.trim() && !selectedFile}
                  >
                    Send
                  </button>
                </div>
                {selectedFile && (
                  <div className="chip" style={{ alignSelf: "flex-start" }}>
                    File: {selectedFile.name}
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      style={{ border: "none", background: "transparent", fontWeight: 800 }}
                    >
                      x
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="section-card" style={{ textAlign: "center", padding: "80px 24px" }}>
                <div style={{ fontSize: "56px", marginBottom: "24px" }}>👋</div>
                <p style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px", color: "#475569" }}>
                  Ready to chat?
                </p>
                <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "24px", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>
                  Pick any conversation from the inbox to start messaging instantly.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
