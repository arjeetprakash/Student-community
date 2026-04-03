import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { connectChatSocket, disconnectChatSocket } from "../lib/chatSocket";

export default function DirectMessages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [toast, setToast] = useState("");
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const selectedConversationRef = useRef(null);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    if (userRole !== "student") {
      navigate("/login");
      return;
    }
    loadConversations();
  }, []);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    const socket = connectChatSocket(token);

    if (!socket) {
      return undefined;
    }

    const getOtherUserId = (conversation) =>
      String(conversation.sender._id) === String(userId)
        ? String(conversation.receiver._id)
        : String(conversation.sender._id);

    const handleIncomingMessage = (message) => {
      if (String(message.sender) === String(userId)) {
        return;
      }

      const senderId = String(message.sender);
      const activeConversationUserId = selectedConversationRef.current
        ? getOtherUserId(selectedConversationRef.current)
        : null;

      if (activeConversationUserId === senderId) {
        setMessages((current) => {
          if (current.some((item) => item._id === message._id)) {
            return current;
          }

          return [...current, message];
        });

        socket.emit("conversation:opened", { otherUserId: senderId });
      }

      loadConversations({ silent: true });
    };

    socket.on("message:new", handleIncomingMessage);

    return () => {
      socket.off("message:new", handleIncomingMessage);
      disconnectChatSocket();
    };
  }, [token, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get("http://localhost:5000/api/chat-request/conversations", { headers });
      setConversations(res.data);
    } catch (err) {
      if (!silent) {
        setToast("Error loading conversations");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const loadMessages = async (conversation, { silent = false } = {}) => {
    try {
      if (!silent) {
        setMessagesLoading(true);
      }
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

      const socket = connectChatSocket(token);
      socket?.emit("conversation:opened", { otherUserId });
    } catch (err) {
      if (!silent) {
        setToast("Error loading messages");
      }
    } finally {
      if (!silent) {
        setMessagesLoading(false);
      }
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    if (!selectedConversation) return;

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
        createdAt: new Date().toISOString(),
        pending: true
      };

      setMessages((current) => [...current, optimisticMessage]);
      setNewMessage("");

      const res = await axios.post(
        "http://localhost:5000/api/message/send",
        { receiverId: otherUserId, text: newMessage },
        { headers }
      );

      setMessages((current) =>
        current.some((item) => item._id === res.data._id)
          ? current.filter((item) => item._id !== optimisticMessage._id)
          : current.map((item) => (item._id === optimisticMessage._id ? res.data : item))
      );
      setToast("Message sent!");
    } catch (err) {
      setMessages((current) => current.filter((item) => !item.pending));
      setNewMessage("");
      setToast("Error sending message");
    }
  };

  const getOtherUser = (conversation) => {
    return conversation.sender._id === userId
      ? conversation.receiver
      : conversation.sender;
  };

  return (
    <div className="app-shell">
      <Navbar role={userRole} />

      <div className="page-hero">
        <h1>Direct Messages</h1>
        <p>Chat with students you're connected with.</p>
      </div>

      {toast && <div className="toast">{toast}</div>}

      <div className="container-main">
        <div className="dm-split-layout">
          {/* Conversations List */}
          <aside className="dm-conversations-panel">
            <h3>Conversations</h3>

            {loading ? (
              <div className="stack">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: "80px" }} />
                ))}
              </div>
            ) : conversations.length > 0 ? (
              <div className="dm-conversations-list">
                {conversations.map((conv) => {
                  const otherUser = getOtherUser(conv);
                  const isSelected =
                    selectedConversation?._id === conv._id;

                  return (
                    <div
                      key={conv._id}
                      className={`dm-conversation-item ${
                        isSelected ? "active" : ""
                      }`}
                      onClick={() => loadMessages(conv)}
                    >
                      <div className="dm-conv-avatar">
                        {otherUser.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="dm-conv-info">
                        <h4>{otherUser.fullName}</h4>
                        <p>{otherUser.email}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="dm-empty">
                <p>No active conversations yet.</p>
                <a href="#/home/connections">Go to Connections & Requests</a>
              </div>
            )}
          </aside>

          {/* Messages Pane */}
          <section className="dm-messages-panel">
            {selectedConversation ? (
              <>
                <div className="dm-messages-header">
                  <div>
                    <h2>{getOtherUser(selectedConversation).fullName}</h2>
                    <p>{getOtherUser(selectedConversation).email}</p>
                  </div>
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
                            className={`dm-message ${
                                isSent ? "sent" : "received"
                            }`}
                          >
                            <p className="dm-message-text">{msg.text}</p>
                            <small className="dm-message-time">
                                {msg.pending ? "Sending..." : new Date(msg.createdAt).toLocaleTimeString()}
                            </small>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="dm-empty">
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
                    onKeyPress={(e) =>
                      e.key === "Enter" && sendMessage()
                    }
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
              <div className="dm-empty-main">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
