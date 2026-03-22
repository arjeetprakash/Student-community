import axios from "axios";

import { useEffect,useState } from "react";

import Navbar from "../components/Navbar";



export default function EditProfile(){



 const [user,setUser]=useState({});

 const [year,setYear]=useState("");



 const role=localStorage.getItem("role");



 useEffect(()=>{

  loadUser();

 },[]);



 const loadUser=()=>{

  const token=localStorage.getItem("token");



  axios.get(

   "http://localhost:5000/api/auth/me",

   {

    headers:{Authorization:`Bearer ${token}`}

   }

  )
  .then(res=>{

   setUser(res.data);

   setYear(res.data.year);

  });

 };



 const updateYear=async()=>{

  const token=localStorage.getItem("token");



  await axios.put(

   "http://localhost:5000/api/auth/update-year",

   {year},

   {

    headers:{Authorization:`Bearer ${token}`}

   }

  );



  alert("profile updated");

 };



 return(

 <div className="app-shell">

 <Navbar role={role}/>



 <div className="hero">

  <h1>Edit Profile</h1>

 </div>



 <div className="section-card stack">



  <div>

   <strong>Name:</strong>

   {user.fullName}

  </div>



  <div>

   <strong>Email:</strong>

   {user.email}

  </div>



  <div>

   <strong>College:</strong>

   {user.college}

  </div>



  <div>

   <strong>Branch:</strong>

   {user.branch}

  </div>



  <div>

   <strong>Year:</strong>



   <select

    className="input"

    value={year}

    onChange={e=>setYear(e.target.value)}

   >

    <option>1st</option>

    <option>2nd</option>

    <option>3rd</option>

    <option>4th</option>

   </select>



  </div>



  <button

   className="btn"

   onClick={updateYear}

  >

   Save

  </button>



 </div>



 </div>

 );

}