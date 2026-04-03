import axios from "axios";
import { useEffect,useState } from "react";
import Navbar from "../components/Navbar";

export default function UserSearch(){

 const [users,setUsers]=useState([]);
 const [searchInput,setSearchInput]=useState("");
 const [search,setSearch]=useState("");
 const [toast, setToast] = useState("");
 const [sendingRequest, setSendingRequest] = useState({});

 const role=localStorage.getItem("role");
 const token = localStorage.getItem("token");

 useEffect(()=>{

  axios.get(
  "http://localhost:5000/api/auth/users",
   {
    headers:{Authorization:`Bearer ${token}`}
   }
  )
  .then(res=>setUsers(res.data))
  .catch(()=>setToast("Unable to load students"));

 },[]);

 const normalizedSearch = search.toLowerCase().trim();

 const filteredUsers=users.filter(u=>{

  const fullName = (u.fullName || "").toLowerCase();
  const username = (u.username || "").toLowerCase();

  if (!normalizedSearch) return true;

  return fullName.includes(normalizedSearch) || username.includes(normalizedSearch);

 });

 const handleSearch = (event) => {
  event.preventDefault();
  setSearch(searchInput);
 };

 const sendMessageRequest = async (receiverId) => {
   try {
     setSendingRequest(prev => ({ ...prev, [receiverId]: true }));
     await axios.post(
       "http://localhost:5000/api/chat-request/send",
       { userId: receiverId },
       { headers: { Authorization: `Bearer ${token}` } }
     );
     setToast("Message request sent!");
     setTimeout(() => setToast(""), 2000);
   } catch (err) {
     setToast("Error sending request: " + (err.response?.data || "Network error"));
     setTimeout(() => setToast(""), 3000);
   } finally {
     setSendingRequest(prev => ({ ...prev, [receiverId]: false }));
   }
 };

 return(

 <div className="app-shell">

 <Navbar role={role}/>

 <div className="hero">

  <h1>Search Users</h1>
  <p>Find and connect with other students in the community.</p>

 </div>

 {toast && <div className="toast">{toast}</div>}

 <form onSubmit={handleSearch} style={{display:"flex",gap:"12px",marginBottom:"24px",flexWrap:"wrap"}}>
  <input
   className="input"
   placeholder="Search by name..."
   value={searchInput}
   onChange={e=>setSearchInput(e.target.value)}
   style={{flex:1,minWidth:"240px"}}
  />
  <button className="btn" type="submit">
   Search
  </button>
 </form>

 <div style={{marginBottom:"16px", color:"#64748b", fontSize:"14px"}}>
  Showing {filteredUsers.length} student{filteredUsers.length === 1 ? "" : "s"}
 </div>

 <div className="grid user-search-grid">

 {filteredUsers.map(u=>(

  <div key={u._id} className="section-card user-card">

   <h3>{u.fullName}</h3>
   <p style={{color: "#64748b", fontSize: "14px", margin: "4px 0"}}>{u.email}</p>

   <div style={{margin: "8px 0", color: "#64748b", fontSize: "13px"}}>
    <p style={{margin: "2px 0"}}>📍 {u.branch || "N/A"}</p>
    <p style={{margin: "2px 0"}}>📚 Year {u.year || "-"}</p>
   </div>

   {role === "student" && (
     <button 
       className="btn secondary"
       onClick={() => sendMessageRequest(u._id)}
       disabled={sendingRequest[u._id]}
       style={{width: "100%", marginTop: "12px"}}
     >
       {sendingRequest[u._id] ? "Sending..." : "💌 Send Message Request"}
     </button>
   )}

  </div>

 ))}

 </div>

 </div>

 );
}