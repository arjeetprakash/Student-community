import axios from "axios";
import { useEffect,useState } from "react";
import Navbar from "../components/Navbar";
import Pagination from "../components/Pagination";

export default function Notices(){

 const [notices,setNotices] = useState([]);

 const [page,setPage] = useState(1);

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

  axios.get(

   "http://localhost:5000/api/notice"

  )
  .then(res=>setNotices(res.data))
  .catch(()=>setNotices([]));

 };



 /* PINNED FIRST */

 const pinned = notices.filter(

  n=>n.isPinned

 );



 const normal = notices.filter(

  n=>!n.isPinned

 );



 const orderedNotices = [

  ...pinned,

  ...normal

 ];



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

 </div>



 <div className="grid">

 {currentNotice.map(n=>(

  <div

   key={n._id}

   className="section-card"

  >



   {n.isPinned && (

    <div

     style={{

      color:"#2563eb",

      fontWeight:"bold"

     }}

    >

     📌 pinned notice

    </div>

   )}



   <p>{n.text}</p>



   {n.file && (

    <a

     href={`http://localhost:5000/uploads/${n.file}`}

     target="_blank"

    >

     open file

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



 </div>

 );

}