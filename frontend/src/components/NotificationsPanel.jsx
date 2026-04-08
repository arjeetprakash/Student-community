import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { connectChatSocket } from "../lib/chatSocket";

const STORAGE_KEY = "campus_notifications";

export default function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 30)));
  }, [notifications]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    const socket = connectChatSocket(token);
    if (!socket) {
      return;
    }

    const onNotification = (payload) => {
      const item = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: payload?.title || "New update",
        message: payload?.message || "You have a new notification",
        type: payload?.type || "general",
        createdAt: payload?.createdAt || new Date().toISOString(),
        read: false,
        noticeId: payload?.noticeId,
        postId: payload?.postId
      };

      setNotifications((prev) => [item, ...prev].slice(0, 30));
    };

    socket.on("notification:new", onNotification);

    return () => {
      socket.off("notification:new", onNotification);
    };
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const onOpen = () => {
    setOpen((prev) => !prev);
    if (!open) {
      markAllRead();
    }
  };

  return (
    <div className="notif-wrap">
      <button type="button" className="btn secondary notif-btn" onClick={onOpen}>
        Notifications
        {unreadCount > 0 && <span className="notif-count">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-head">
            <strong>Live Updates</strong>
            <div style={{ display: "flex", gap: "8px" }}>
              <button type="button" className="notif-link-btn" onClick={markAllRead}>Mark read</button>
              <button type="button" className="notif-link-btn" onClick={clearAll}>Clear</button>
            </div>
          </div>

          {notifications.length === 0 && <p className="notif-empty">No notifications yet.</p>}

          <div className="notif-list">
            {notifications.map((item) => (
              <article key={item.id} className={`notif-item ${item.read ? "read" : ""}`}>
                <small>{item.title}</small>
                <p>{item.message}</p>
                <div className="notif-item-foot">
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                  {item.type === "notice" ? <Link to="/home/notices">Open</Link> : <Link to="/home">View</Link>}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
