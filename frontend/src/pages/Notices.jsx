import axios from "axios";

import { useEffect,useState } from "react";

import Navbar from "../components/Navbar";



export default function Notices(){

 const [notices,setNotices]=useState([]);

 const role=localStorage.getItem("role");



 useEffect(()=>{

  axios.get("http://localhost:5000/api/notice")

  .then(res=>setNotices(res.data));



  localStorage.setItem(

   "noticeSeen",

   new Date().toISOString()

  );



 },[]);



 return(

  <div className="app-shell">

   <Navbar role={role}/>



   <div className="hero">

    <h1>notices</h1>

   </div>



   <div className="grid">

    {notices.map(n=>(

     <div

      key={n._id}

      className="section-card"

     >



      {n.isPinned && (

       <div>

        📌 pinned

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



  </div>

 );

}