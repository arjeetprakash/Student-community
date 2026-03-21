import axios from "axios";

import { useState,useEffect } from "react";

import Navbar from "../components/Navbar";



export default function Admin(){

 const [notice,setNotice]=useState("");

 const [file,setFile]=useState(null);

 const [pinned,setPinned]=useState(false);

 const [notices,setNotices]=useState([]);

 const role=localStorage.getItem("role");



 useEffect(()=>{

  loadNotices();

 },[]);



 const loadNotices=()=>{

  axios.get("http://localhost:5000/api/notice")

  .then(res=>setNotices(res.data));

 };



 const addNotice=async()=>{

  const token=localStorage.getItem("token");



  const formData=new FormData();

  formData.append("text",notice);

  formData.append("file",file);

  formData.append("isPinned",pinned);



  await axios.post(

   "http://localhost:5000/api/notice",

   formData,

   {

    headers:{

     Authorization:`Bearer ${token}`

    }

   }

  );



  setNotice("");

  setFile(null);

  setPinned(false);



  loadNotices();

 };



 return(

  <div className="app-shell">

   <Navbar role={role}/>



   <div className="section-card stack">

    <h2>create notice</h2>



    <input

     className="input"

     placeholder="notice text"

     value={notice}

     onChange={

      e=>setNotice(

       e.target.value

      )

     }

    />



    <input

     type="file"

     onChange={

      e=>setFile(

       e.target.files[0]

      )

     }

    />



    <label>

     pin notice

     <input

      type="checkbox"

      checked={pinned}

      onChange={

       e=>setPinned(

        e.target.checked

       )

      }

     />

    </label>



    <button

     className="btn"

     onClick={addNotice}

    >

     publish notice

    </button>

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

        open attachment

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