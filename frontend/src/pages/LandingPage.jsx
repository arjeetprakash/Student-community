import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div style={{minHeight:"100vh",background:"radial-gradient(circle at 10% 20%, #e0f2fe 0, transparent 30%),radial-gradient(circle at 90% 10%, #ede9fe 0, transparent 35%),#0f172a"}}>

      {/* NAVBAR */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "18px 28px",
        alignItems:"center",
        color: "white"
      }}>
        <h2 style={{margin:0}}>🎓 StudentHub</h2>

        <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
          <Link to="/login" style={{ padding:"8px 12px", color: "#0f172a", background:"#fff", borderRadius:"10px", fontWeight:700 }}>
            Student Login
          </Link>

          <Link to="/login" style={{ padding:"8px 12px", color: "white", border:"1px solid rgba(255,255,255,0.4)", borderRadius:"10px", fontWeight:700 }}>
            Admin Login
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div style={{
        textAlign: "center",
        padding: "110px 24px 80px 24px",
        color: "white"
      }}>
        <div style={{maxWidth:"760px",margin:"0 auto"}}>
          <p style={{letterSpacing:"4px",textTransform:"uppercase",color:"#a5b4fc",fontWeight:700}}>Campus-first community</p>
          <h1 style={{fontSize:"44px",margin:"10px 0"}}>Connect • Learn • Grow Together</h1>
          <p style={{color:"#e2e8f0",fontSize:"18px",marginTop:"10px"}}>
            Join study groups, get campus updates in real time, and build your network with peers and mentors.
          </p>

          <div style={{display:"flex",justifyContent:"center",gap:"14px",marginTop:"30px",flexWrap:"wrap"}}>
            <Link to="/login">
              <button style={{
                padding: "14px 20px",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(120deg,#22d3ee,#6366f1)",
                color: "white",
                fontWeight: "800",
                fontSize:"16px",
                boxShadow:"0 15px 40px rgba(99,102,241,0.35)",
                cursor:"pointer"
              }}>
                Launch Student Space
              </button>
            </Link>

            <Link to="/login">
              <button style={{
                padding: "14px 20px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.4)",
                background: "transparent",
                color: "white",
                fontWeight: "700",
                cursor:"pointer"
              }}>
                Explore as Admin
              </button>
            </Link>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"12px",marginTop:"40px"}}>
            {["Clubs & events","Peer Q&A","Placement prep","Notice board"].map(item=>(
              <div key={item} style={{
                background:"rgba(255,255,255,0.08)",
                border:"1px solid rgba(255,255,255,0.12)",
                borderRadius:"14px",
                padding:"14px",
                color:"#e2e8f0",
                backdropFilter:"blur(6px)",
                fontWeight:600
              }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div style={{
        background:"#f8fafc",
        padding:"60px 24px",
        borderTopLeftRadius:"24px",
        borderTopRightRadius:"24px",
        marginTop:"-30px"
      }}>
        <div style={{maxWidth:"1100px",margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:"18px"}}>
          {[{
            title:"📚 Learn",
            desc:"Curated resources and peer answers to keep coursework on track."
          },{
            title:"🤝 Connect",
            desc:"Find teammates, mentors, and club mates instantly."
          },{
            title:"🚀 Grow",
            desc:"Stay job-ready with updates, notices, and project ideas."
          },{
            title:"🔔 Stay Notified",
            desc:"Pinned admin notices and instant highlights each visit."
          }].map(card=>(
            <div key={card.title} className="section-card" style={{boxShadow:"0 15px 35px rgba(15,23,42,0.08)"}}>
              <h3 style={{margin:"0 0 6px 0"}}>{card.title}</h3>
              <p style={{margin:0,color:"#475569"}}>{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}