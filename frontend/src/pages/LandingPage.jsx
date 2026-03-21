import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div>

      {/* NAVBAR */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "15px 30px",
        background: "#0f172a",
        color: "white"
      }}>
        <h2>🎓 StudentHub</h2>

        <div>
          <Link to="/login" style={{ margin: "10px", color: "white" }}>
            Student Login
          </Link>

          <Link to="/login" style={{ margin: "10px", color: "white" }}>
            Admin Login
          </Link>

          <Link to="/about" style={{ margin: "10px", color: "white" }}>
            More
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div style={{
        textAlign: "center",
        padding: "120px",
        background: "linear-gradient(120deg,#2563eb,#4f46e5)",
        color: "white"
      }}>
        <h1>Welcome to Student Community 🚀</h1>
        <p>Connect • Learn • Grow Together</p>

        <Link to="/login">
          <button style={{
            marginTop: "20px",
            padding: "12px 20px",
            borderRadius: "10px",
            border: "none",
            background: "#fff",
            color: "#2563eb",
            fontWeight: "bold"
          }}>
            Get Started
          </button>
        </Link>
      </div>

      {/* FEATURES */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "40px",
        marginTop: "50px"
      }}>
        <div>
          <h3>📚 Learn</h3>
          <p>Share knowledge</p>
        </div>

        <div>
          <h3>🤝 Connect</h3>
          <p>Meet students</p>
        </div>

        <div>
          <h3>🚀 Grow</h3>
          <p>Build your future</p>
        </div>
      </div>

    </div>
  );
}