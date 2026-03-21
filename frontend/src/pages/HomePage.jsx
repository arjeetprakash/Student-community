import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <h1 style={{ color: "red" }}>HOME PAGE LOADED 🚀</h1>
  );
}
    <div>

      {/* NAVBAR */}
      <nav style={{background:"#000", padding:"10px"}}>
        <h3 style={{color:"white"}}>🎓 StudentHub</h3>

        <Link to="/" style={{margin:"10px", color:"white"}}>Login</Link>
        <Link to="/" style={{margin:"10px", color:"white"}}>Signup</Link>
        <Link to="/admin" style={{margin:"10px", color:"white"}}>Admin</Link>
      </nav>

      {/* HERO */}
      <div style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1523580494863-6f3031224c94')",
        backgroundSize: "cover",
        color: "white",
        padding: "120px",
        textAlign: "center"
      }}>
        <h1>Welcome to Student Community</h1>
        <p>Connect • Learn • Grow</p>
      </div>

      {/* FEATURES */}
      <div style={{display:"flex", justifyContent:"center", marginTop:"40px"}}>
        <div style={{margin:"20px"}}>
          <h3>Forum</h3>
          <p>Discuss & Learn</p>
        </div>

        <div style={{margin:"20px"}}>
          <h3>Events</h3>
          <p>Hackathons & Workshops</p>
        </div>

        <div style={{margin:"20px"}}>
          <h3>Opportunities</h3>
          <p>Jobs & Internships</p>
        </div>
      </div>

    </div>