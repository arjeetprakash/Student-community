import axios from "axios";
import { useEffect,useState } from "react";
import Navbar from "../components/Navbar";

export default function UserSearch(){

 const [users,setUsers]=useState([]);
 const [search,setSearch]=useState("");

 const role=localStorage.getItem("role");

 useEffect(()=>{

  const token=localStorage.getItem("token");

  axios.get(
   "http://localhost:5000/api/admin/users",
   {
    headers:{Authorization:`Bearer ${token}`}
   }
  )
  .then(res=>setUsers(res.data));

 },[]);

 const filteredUsers=users.filter(u=>

  u.fullName
  ?.toLowerCase()
  .includes(search.toLowerCase())

 );

 return(

 <div className="app-shell">

 <Navbar role={role}/>

 <div className="hero">

  <h1>Search Users</h1>

 </div>

 <input
  className="input"
  placeholder="search..."
  onChange={e=>setSearch(e.target.value)}
 />

 <div className="grid">

 {filteredUsers.map(u=>(

  <div key={u._id} className="section-card">

   <h3>{u.fullName}</h3>

   <p>{u.branch}</p>

   <small>{u.year}</small>

  </div>

 ))}

 </div>

 </div>

 );
}