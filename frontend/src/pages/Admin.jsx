import axios from "axios";
import { useEffect,useState } from "react";
import Navbar from "../components/Navbar";

export default function Admin(){

 const role = localStorage.getItem("role");

 const [users,setUsers] = useState([]);

 const [search,setSearch] = useState("");

 const [branch,setBranch] = useState("");

 const [year,setYear] = useState("");

 const [selectedUser,setSelectedUser] = useState(null);

 const [message,setMessage] = useState("");

 const [notice,setNotice] = useState("");

 const [notices,setNotices] = useState([]);

 const [page,setPage] = useState(1);

 const usersPerPage = 6;



 useEffect(()=>{

  const token = localStorage.getItem("token");



  if(!token){

   window.location="/";

   return;

  }



  if(role !== "admin"){

   window.location="/home";

   return;

  }



  loadUsers();

  loadNotices();

 },[]);



 /* LOAD USERS */

 const loadUsers = ()=>{

  const token = localStorage.getItem("token");



  axios.get(

   "http://localhost:5000/api/admin/users",

   {

    headers:{Authorization:`Bearer ${token}`}

   }

  )
  .then(res=>setUsers(res.data));

 };



 /* FILTER */

 const filteredUsers = users.filter(u=>{

  return(

   (branch ? u.branch===branch : true) &&

   (year ? u.year===year : true) &&

   (search ?

    u.fullName.toLowerCase().includes(search.toLowerCase())

    : true)

  );

 });



 /* PAGINATION */

 const lastIndex = page * usersPerPage;

 const firstIndex = lastIndex - usersPerPage;

 const currentUsers = filteredUsers.slice(

  firstIndex,

  lastIndex

 );



 const totalPages = Math.ceil(

  filteredUsers.length / usersPerPage

 );



 /* MESSAGE */

 const sendMessage = async ()=>{

  const token = localStorage.getItem("token");



  await axios.post(

   "http://localhost:5000/api/message/send",

   {

    receiverId:selectedUser._id,

    text:message

   },

   {

    headers:{Authorization:`Bearer ${token}`}

   }

  );



  setMessage("");

  alert("message sent");

 };



 /* NOTICE */

 const loadNotices = ()=>{

  axios.get(

   "http://localhost:5000/api/notice"

  )
  .then(res=>setNotices(res.data));

 };



 const addNotice = async ()=>{

  const token = localStorage.getItem("token");



  await axios.post(

   "http://localhost:5000/api/notice",

   {

    text:notice

   },

   {

    headers:{Authorization:`Bearer ${token}`}

   }

  );



  setNotice("");

  loadNotices();

 };



 return(

 <div className="app-shell">

 <Navbar role={role}/>



 <div className="hero">

  <h1>Admin Dashboard</h1>

  <p>Manage students & notices</p>

 </div>



 {/* SEARCH + FILTER */}

 <div className="section-card stack">



  <input

   className="input"

   placeholder="Search user..."

   onChange={e=>setSearch(e.target.value)}

  />



  <div style={{display:"flex",gap:"10px"}}>



   <select

    className="input"

    onChange={e=>setBranch(e.target.value)}

   >

    <option value="">All Branch</option>

    <option>CSE</option>

    <option>IT</option>

    <option>ME</option>

    <option>EE</option>

    <option>CE</option>

    <option>OTHER</option>

   </select>



   <select

    className="input"

    onChange={e=>setYear(e.target.value)}

   >

    <option value="">All Year</option>

    <option>1st</option>

    <option>2nd</option>

    <option>3rd</option>

    <option>4th</option>

   </select>



  </div>



 </div>



 {/* USERS */}

 <div className="grid">

 {currentUsers.map(u=>(



  <div

   key={u._id}

   className="section-card"

   onClick={()=>setSelectedUser(u)}

   style={{cursor:"pointer"}}

  >



   <h3>

    {u.fullName}

   </h3>



   <p>

    {u.email}

   </p>



   <div className="badge">

    {u.branch}

   </div>



   <small>

    {u.year}

   </small>



  </div>



 ))}

 </div>



 {/* PAGINATION */}

 <div

  style={{

   display:"flex",

   justifyContent:"center",

   gap:"10px",

   marginTop:"20px"

  }}

 >



 <button

  className="btn secondary"

  disabled={page===1}

  onClick={()=>setPage(page-1)}

 >

  Prev

 </button>



 <span>

  Page {page} / {totalPages || 1}

 </span>



 <button

  className="btn secondary"

  disabled={page===totalPages}

  onClick={()=>setPage(page+1)}

 >

  Next

 </button>



 </div>



 {/* USER DETAIL */}

 {selectedUser && (

 <div className="section-card stack">

  <h2>User Details</h2>



  <p>

   Name:

   {selectedUser.fullName}

  </p>



  <p>

   Email:

   {selectedUser.email}

  </p>



  <p>

   College:

   {selectedUser.college}

  </p>



  <p>

   Branch:

   {selectedUser.branch}

  </p>



  <p>

   Year:

   {selectedUser.year}

  </p>



  <textarea

   className="input"

   placeholder="Send message"

   onChange={e=>setMessage(e.target.value)}

  />



  <button

   className="btn"

   onClick={sendMessage}

  >

   Send Message

  </button>



 </div>

 )}



 {/* NOTICE */}

 <div className="hero">

  <h2>Notices</h2>

 </div>



 <div className="section-card stack">

  <input

   className="input"

   placeholder="Write notice"

   value={notice}

   onChange={e=>setNotice(e.target.value)}

  />



  <button

   className="btn"

   onClick={addNotice}

  >

   Publish

  </button>

 </div>



 <div className="grid">

 {notices.map(n=>(

  <div

   key={n._id}

   className="section-card"

  >



   <p>

    {n.text}

   </p>



   <small>

    {

     new Date(n.createdAt)

     .toLocaleString()

    }

   </small>



  </div>

 ))}

 </div>



 </div>

 );

}