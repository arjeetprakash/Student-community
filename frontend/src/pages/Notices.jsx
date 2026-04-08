import axios from "axios";
import { useEffect,useMemo,useState } from "react";
import Navbar from "../components/Navbar";
import Pagination from "../components/Pagination";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "https://student-community-j7iy.onrender.com").replace(/\/$/, "");

export default function Notices(){

 const [notices,setNotices] = useState([]);

 const [page,setPage] = useState(1);
 const [search,setSearch] = useState("");
 const [showPinnedOnly,setShowPinnedOnly] = useState(false);
 const [loading,setLoading] = useState(true);

 const noticePerPage = 6;

 const role = localStorage.getItem("role");



 useEffect(()=>{

  loadNotices();



  localStorage.setItem(

   "noticeSeen",

   new Date().toISOString()

  );



 },[]);



 const loadNotices = ()=>{

  setLoading(true);
  axios.get(

    `${API_BASE_URL}/api/notice`

  )
  .then(res=>setNotices(res.data))
  .catch(()=>setNotices([]))
  .finally(()=>setLoading(false));

 };


 const orderedNotices = useMemo(()=>{

  const recentSeen = localStorage.getItem("noticeSeen");

  const filtered = notices.filter(n=>{
   const matchesText = n.text?.toLowerCase().includes(search.toLowerCase());
   const matchesPin = showPinnedOnly ? n.isPinned : true;
   return matchesText && matchesPin;
  });

  const sorted = [
   ...filtered.filter(n=>n.isPinned),
   ...filtered.filter(n=>!n.isPinned)
  ];

  return sorted.map(n=>(
   {
    ...n,
    isNew: recentSeen ? new Date(n.createdAt) > new Date(recentSeen) : false
   }
  ));

 },[notices,search,showPinnedOnly]);


 /* PAGINATION */

 const lastIndex =

  page * noticePerPage;



 const firstIndex =

  lastIndex - noticePerPage;



 const currentNotice =

  orderedNotices.slice(

   firstIndex,

   lastIndex

  );



 return(

 <div className="app-shell">

 <Navbar role={role}/>



 <div className="hero">

  <h1>Notices</h1>
  <p>Stay on top of new announcements</p>

  <div style={{display:"flex",gap:"10px",flexWrap:"wrap",justifyContent:"center",marginTop:"10px"}}>
   <input
    className="input"
    placeholder="Search notices"
    value={search}
    onChange={e=>{setSearch(e.target.value); setPage(1);} }
    style={{maxWidth:"320px"}}
   />

   <label style={{display:"flex",gap:"8px",alignItems:"center",fontWeight:600}}>
    <input
     type="checkbox"
     checked={showPinnedOnly}
     onChange={e=>{setShowPinnedOnly(e.target.checked); setPage(1);} }
    />
    Pinned only
   </label>

   <button className="btn secondary" onClick={loadNotices}>
    Refresh
   </button>
  </div>
 </div>



 {loading ? (
  <div className="grid">
   {[1,2,3].map(i=>(
    <div key={i} className="section-card skeleton"/>
   ))}
  </div>
 ) : (
  <>
   {currentNotice.length===0 && (
    <div className="section-card" style={{textAlign:"center"}}>
     <p>No notices match.</p>
     <small>Clear filters or check back later.</small>
    </div>
   )}

   <div className="grid">

   {currentNotice.map(n=>(

    <div

     key={n._id}

     className="section-card"

    >



     <div style={{display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"}}>
      {n.isPinned && (

       <div className="pin">

        📌 pinned

       </div>

      )}

      {n.isNew && (
       <div className="chip subtle">New</div>
      )}
     </div>



     <p>{n.text}</p>



     {n.file && (

      <a

         href={`${API_BASE_URL}/uploads/${n.file}`}

       target="_blank"

       rel="noreferrer"

       className="chip"

      >

       📂 Open file

      </a>

     )}



     <small>

      {

       new Date(

        n.createdAt

       ).toLocaleString()

      }

     </small>



    </div>

   ))}

   </div>



   <Pagination

    totalItems={orderedNotices.length}

    itemsPerPage={noticePerPage}

    currentPage={page}

    setCurrentPage={setPage}

   />
  </>
 )}



 </div>

 );
}
