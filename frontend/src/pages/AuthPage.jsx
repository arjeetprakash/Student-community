import axios from "axios";
import { useState } from "react";
import "../index.css";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [data, setData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!data.email || !data.password || (!isLogin && !data.username)) {
      alert("Fill all fields");
      return;
    }

    try {
      setLoading(true);

      if (isLogin) {
        const res = await axios.post("http://localhost:5000/api/auth/login", {
          email: data.email,
          password: data.password
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("email", data.email);

        if (res.data.role === "admin") {
          window.location = "/admin";
        } else {
          window.location = "/home";
        }
      } else {
        await axios.post("http://localhost:5000/api/auth/register", data);
        alert("Account Created! Now login.");
        setIsLogin(true);
      }
    } catch (err) {
      console.log(err);
      alert(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell" style={{ maxWidth: 420, textAlign: "center" }}>
      <div className="hero">
        <h1>{isLogin ? "Login" : "Create Account"}</h1>
        <p>{isLogin ? "Access your community account" : "Join the community"}</p>
      </div>

      <div className="section-card stack">
        {!isLogin && (
          <input
            className="input"
            placeholder="Username"
            onChange={(e) => setData({ ...data, username: e.target.value })}
          />
        )}

        <input
          className="input"
          placeholder="Email"
          type="email"
          onChange={(e) => setData({ ...data, email: e.target.value })}
        />

        <input
          className="input"
          type="password"
          placeholder="Password"
          onChange={(e) => setData({ ...data, password: e.target.value })}
        />

        <button className="btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
        </button>

        <div style={{ color: "#475569" }}>
          {isLogin ? "New user?" : "Already have an account?"}
        </div>

        <button
          className="btn secondary"
          onClick={() => setIsLogin(!isLogin)}
          disabled={loading}
        >
          {isLogin ? "Create Account" : "Login"}
        </button>
      </div>
    </div>
  );
}
