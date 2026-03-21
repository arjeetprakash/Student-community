import axios from "axios";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [role, setRole] = useState(localStorage.getItem("role") || "student");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location = "/";
      return;
    }
    setRole(localStorage.getItem("role") || "student");
    axios
      .get("http://localhost:5000/api/post", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setPosts(res.data))
      .catch(() => setPosts([]));
  }, []);

  const createPost = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location = "/";
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:5000/api/post",
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prev) => [res.data, ...prev]);
      setTitle("");
      setContent("");
    } catch (err) {
      console.error("Failed to create post", err);
    }
  };

  const deletePost = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location = "/";
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/post/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Failed to delete post", err);
    }
  };

  return (
    <div className="app-shell">
      <Navbar role={role} />

      <div className="hero">
        <h1>Student Hub</h1>
        <p>Share updates, questions, and projects with your peers.</p>
      </div>

      <div className="section-card stack">
        <h3 style={{ margin: 0 }}>Create a Post</h3>
        <input
          className="input"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="input"
          rows={4}
          placeholder="Share something..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button className="btn" onClick={createPost}>Share</button>
      </div>

      <div className="grid">
        {posts.map((p) => (
          <div key={p._id} className="section-card">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px"
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#2563eb",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  marginRight: "10px"
                }}
              >
                {p.author?.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{p.author}</strong>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#475569"
                  }}
                >
                  {p.role?.toUpperCase()}
                </div>
              </div>
            </div>

            <h3>{p.title}</h3>
            <p>{p.content}</p>
            <small>{new Date(p.createdAt).toLocaleString()}</small>

            {role === "admin" && (
              <button
                className="btn secondary"
                onClick={() => deletePost(p._id)}
                style={{ marginTop: "10px" }}
              >
                Delete Post
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
