import axios from "axios";
import { useEffect,useState } from "react";
import Navbar from "../components/Navbar";



export default function EditProfile(){



 const [user,setUser]=useState({});
 const [form,setForm]=useState({
  fullName:"",
  college:"",
  branch:"",
  year:"",
  profilePhoto:""
 });
 const [status,setStatus]=useState("");
 const [saving,setSaving]=useState(false);



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
   setForm({
    fullName:res.data.fullName || "",
    college:res.data.college || "",
    branch:res.data.branch || "",
    year:res.data.year || "",
    profilePhoto:res.data.profilePhoto || ""
   });

  });

 };



 const updateProfile=async()=>{

  const token=localStorage.getItem("token");

  try{

   setSaving(true);
   setStatus("Saving...");

   const res = await axios.put(

    "http://localhost:5000/api/auth/update-profile",

    form,

    {

     headers:{Authorization:`Bearer ${token}`}

    }

   );

   setUser(res.data);
   setStatus("Profile updated");

  }
  catch(err){

   console.log(err);
   setStatus("Update failed");

  }
  finally{
   setSaving(false);
   setTimeout(()=>setStatus(""),1800);
  }

 };



 return(

 <div className="app-shell">

 <Navbar role={role}/>



 <div className="hero">

  <h1>Edit Profile</h1>
  <p>Keep your student info current</p>
  {status && <div className="toast">{status}</div>}

 </div>



 <div className="section-card stack">



  <label className="stack">

   <strong>Name</strong>

   <input
    className="input"
    value={form.fullName}
    onChange={e=>setForm({...form,fullName:e.target.value})}
   />

  </label>



  <label className="stack">

   <strong>Email</strong>

   <input
    className="input"
    value={user.email || ""}
    disabled
   />

  </label>



  <label className="stack">

   <strong>College</strong>

   <input
    className="input"
    value={form.college}
    onChange={e=>setForm({...form,college:e.target.value})}
   />

  </label>



  <label className="stack">

   <strong>Branch</strong>

   <input
    className="input"
    value={form.branch}
    onChange={e=>setForm({...form,branch:e.target.value})}
   />

  </label>



  <label className="stack">

   <strong>Year</strong>

   <select

    className="input"

    value={form.year}

    onChange={e=>setForm({...form,year:e.target.value})}

   >

    <option value="">Select year</option>
    <option>1st</option>
    <option>2nd</option>
    <option>3rd</option>
    <option>4th</option>

   </select>

  </label>



  <label className="stack">

   <strong>Profile Photo URL</strong>

   <input
    className="input"
    value={form.profilePhoto}
    onChange={e=>setForm({...form,profilePhoto:e.target.value})}
    placeholder="https://..."
   />

   {form.profilePhoto && (
    <img
     src={form.profilePhoto}
     alt="preview"
     width="120"
     style={{borderRadius:"14px",border:"1px solid #e2e8f0"}}
    />
   )}

  </label>



  <button

   className="btn"

   onClick={updateProfile}

   disabled={saving}

  >

   {saving ? "Saving..." : "Save changes"}

  </button>



 </div>



 </div>

 );
}
