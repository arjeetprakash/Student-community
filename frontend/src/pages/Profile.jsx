import axios from "axios";
import { useEffect,useState } from "react";
import Navbar from "../components/Navbar";
import Pagination from "../components/Pagination";

export default function Profile(){

 const [user,setUser]=useState({});
 const [posts,setPosts]=useState([]);
 const [year,setYear]=useState("");
 const [editingYear,setEditingYear]=useState(false);
 const [page,setPage]=useState(1);

 const postsPerPage=4;

 const role=localStorage.getItem("role");



 useEffect(()=>{

  loadData();

 },[]);



 const loadData=async()=>{

  try{

   const token=localStorage.getItem("token");



   // USER DATA
   const userRes=await axios.get(

    "http://localhost:5000/api/auth/me",

    {

     headers:{
      Authorization:`Bearer ${token}`
     }

    }

   );



   setUser(userRes.data);

   setYear(userRes.data.year);



   // USER POSTS (filter from all posts)
   const postRes=await axios.get(

    "http://localhost:5000/api/post"

   );



   const myPosts=postRes.data.filter(

    p=>p.userId===userRes.data._id

   );



   setPosts(myPosts);



  }
  catch(err){

   console.log(err);

  }

 };



 /* UPDATE YEAR */

 const updateYear=async()=>{

  try{

   const token=localStorage.getItem("token");



   await axios.put(

    "http://localhost:5000/api/auth/update-year",

    {year},

    {

     headers:{
      Authorization:`Bearer ${token}`
     }

    }

   );



   setEditingYear(false);

   loadData();

  }
  catch(err){

   console.log(err);

  }

 };



 /* PAGINATION */

 const lastIndex=page*postsPerPage;

 const firstIndex=lastIndex-postsPerPage;



 const currentPosts=posts.slice(

  firstIndex,
  lastIndex

 );



 return(

 <div className="app-shell">

 <Navbar role={role}/>



 <div className="hero">

  <h1>My Profile</h1>

 </div>



 <div className="section-card stack">



  {/* PROFILE IMAGE */}

  <img

   src={

    user.profilePhoto

     ? user.profilePhoto

     : "https://via.placeholder.com/100"

   }

   width="100"

   style={{

    borderRadius:"50%"

   }}

  />



  <div>

   <strong>Name:</strong>

   {user.fullName}

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

 <span style={{marginLeft:"10px"}}>

  {user.year}

 </span>

</div>



  <div>

   Total Posts: {posts.length}

  </div>



 </div>

 <div className="hero">

  <h2>My Posts</h2>

 </div>



 <div className="grid">

 {

  currentPosts.map(p=>(

   <div

    key={p._id}

    className="section-card"

   >



    <h3>{p.title}</h3>

    <p>{p.content}</p>



    <small>

     {

      new Date(

       p.createdAt

      ).toLocaleString()

     }

    </small>



   </div>

  ))

 }

 </div>



 <Pagination

  totalItems={posts.length}

  itemsPerPage={postsPerPage}

  currentPage={page}

  setCurrentPage={setPage}

 />



 </div>

 );

}