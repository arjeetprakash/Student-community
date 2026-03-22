import { Link } from "react-router-dom";
import { useState } from "react";

export default function Navbar({ role }){

 const [showMenu,setShowMenu] = useState(false);

 const logout = ()=>{
  localStorage.clear();
  window.location="/";
 };

 return(

 <div className="navbar">

  <div className="nav-links">

   <strong>CampusConnect</strong>

   <Link to="/home">Home</Link>

   <Link to="/home/notices">Notices</Link>

   <Link to="/home/search">Search</Link>

   {/* PROFILE DROPDOWN */}

   <div
    style={{position:"relative"}}
   >

    <span
     style={{cursor:"pointer"}}
     onClick={()=>setShowMenu(!showMenu)}
    >
     Profile ▼
    </span>

    {showMenu && (

     <div
      style={{
       position:"absolute",
       top:"35px",
       left:"0",
       background:"#fff",
       borderRadius:"8px",
       padding:"8px",
       boxShadow:"0 5px 15px rgba(0,0,0,0.1)",
       display:"flex",
       flexDirection:"column",
       minWidth:"150px",
       zIndex:1000
      }}
     >

      <Link to="/home/profile">View Profile</Link>

      <Link to="/home/profile/edit">Edit Profile</Link>

     </div>

    )}

   </div>

   {role==="admin" && (
    <Link to="/admin">Admin</Link>
   )}

  </div>

  <div className="nav-links">

   <div className="badge">
    {role}
   </div>

   <button
    className="btn secondary"
    onClick={logout}
   >
    Logout
   </button>

  </div>

 </div>

 );
}