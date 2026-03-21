import axios from "axios";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function Dashboard(){

 const [posts,setPosts] = useState([]);
 const [title,setTitle] = useState("");
 const [content,setContent] = useState("");
 const [file,setFile] = useState(null);

 const role = localStorage.getItem("role");



 useEffect(()=>{

  loadPosts();

 },[]);



 // LOAD POSTS

 const loadPosts = ()=>{

  const token = localStorage.getItem("token");

  axios.get(

   "http://localhost:5000/api/post",

   {

    headers:{

     Authorization:`Bearer ${token}`

    }

   }

  )

  .then(res=>{

   setPosts(res.data);

  })

  .catch(err=>console.log(err));

 };



 // CREATE POST

 const createPost = async ()=>{

  try{

   const token = localStorage.getItem("token");

   const formData = new FormData();

   formData.append("title",title);

   formData.append("content",content);

   if(file){

    formData.append("file",file);

   }



   await axios.post(

    "http://localhost:5000/api/post",

    formData,

    {

     headers:{

      Authorization:`Bearer ${token}`

     }

    }

   );



   setTitle("");

   setContent("");

   setFile(null);



   loadPosts();

  }

  catch(err){

   console.log("create error",err);

  }

 };



 // DELETE POST (soft delete)

 const deletePost = async(id)=>{

  try{

   const token = localStorage.getItem("token");



   await axios.delete(

    `http://localhost:5000/api/post/${id}`,

    {

     headers:{

      Authorization:`Bearer ${token}`

     }

    }

   );



   loadPosts();

  }

  catch(err){

   console.log("delete error",err);

  }

 };



 // PIN POST

 const pinPost = async(id)=>{

  try{

   const hours = prompt(

    "Pin duration in hours:\n1 = 1 hour\n2 = 2 hours\n24 = 1 day\nLeave empty = permanent"

   );



   const token = localStorage.getItem("token");



   await axios.put(

    `http://localhost:5000/api/post/pin/${id}`,

    {hours},

    {

     headers:{

      Authorization:`Bearer ${token}`

     }

    }

   );



   loadPosts();

  }

  catch(err){

   console.log("pin error",err);

  }

 };



 // UNPIN POST

 const unpinPost = async(id)=>{

  try{

   const token = localStorage.getItem("token");



   await axios.put(

    `http://localhost:5000/api/post/unpin/${id}`,

    {},

    {

     headers:{

      Authorization:`Bearer ${token}`

     }

    }

   );



   loadPosts();

  }

  catch(err){

   console.log("unpin error",err);

  }

 };



 // REMOVE EXPIRED PIN FROM UI

 const filteredPosts = posts.map(p=>{

  if(p.pinnedUntil && new Date(p.pinnedUntil) < new Date()){

   p.isPinned = false;

  }

  return p;

 });



 // PINNED POSTS FIRST

 const pinnedPosts = filteredPosts.filter(p=>p.isPinned);

 const normalPosts = filteredPosts.filter(p=>!p.isPinned);



 const orderedPosts = [...pinnedPosts,...normalPosts];



 return(

  <div className="app-shell">

   <Navbar role={role}/>



   <div className="hero">

    <h1>Student Hub</h1>

    <p>Share updates with your community</p>

   </div>



   {/* CREATE POST */}

   <div className="section-card stack">

    <h3>Create Post</h3>



    <input

     className="input"

     placeholder="Title"

     value={title}

     onChange={e=>setTitle(e.target.value)}

    />



    <textarea

     className="input"

     rows={4}

     placeholder="Content"

     value={content}

     onChange={e=>setContent(e.target.value)}

    />



    <input

     type="file"

     onChange={e=>setFile(e.target.files[0])}

    />



    <button

     className="btn"

     onClick={createPost}

    >

     Post

    </button>

   </div>



   {/* POSTS */}

   <div className="grid">

    {orderedPosts.map(p=>(

     <div key={p._id} className="section-card">



      {/* AUTHOR INFO */}

      <div

       style={{

        display:"flex",

        alignItems:"center",

        marginBottom:"10px"

       }}

      >

       <div

        style={{

         width:"40px",

         height:"40px",

         borderRadius:"50%",

         background:"#2563eb",

         color:"white",

         display:"flex",

         alignItems:"center",

         justifyContent:"center",

         fontWeight:"bold",

         marginRight:"10px"

        }}

       >

        {p.author?.charAt(0).toUpperCase()}

       </div>



       <div>

        <strong>{p.author}</strong>

        <div

         style={{

          fontSize:"12px",

          color:"#475569"

         }}

        >

         {p.role?.toUpperCase()}

        </div>

       </div>

      </div>



      {/* PIN LABEL */}

      {p.isPinned && (

       <div

        style={{

         color:"#2563eb",

         fontWeight:"bold",

         marginBottom:"5px"

        }}

       >

        📌 pinned post

       </div>

      )}



      {/* CONTENT */}

      {p.isDeleted ? (

       <p style={{color:"red"}}>

        This post was removed by admin

       </p>

      ):(

       <>

        <h3>{p.title}</h3>

        <p>{p.content}</p>



        {p.file && (

         <a

          href={`http://localhost:5000/uploads/${p.file}`}

          target="_blank"

         >

          View attachment

         </a>

        )}

       </>

      )}



      {/* TIME */}

      <div

       style={{

        fontSize:"12px",

        color:"#64748b",

        marginTop:"5px"

       }}

      >

       {

        new Date(p.createdAt)

        .toLocaleString()

       }

      </div>



      {/* ADMIN CONTROLS */}

      {role==="admin" && !p.isDeleted && (

       <div style={{marginTop:"10px"}}>



        <button

         className="btn secondary"

         onClick={()=>deletePost(p._id)}

        >

         Delete

        </button>



        {!p.isPinned ? (

         <button

          className="btn"

          style={{marginLeft:"10px"}}

          onClick={()=>pinPost(p._id)}

         >

          Pin

         </button>

        ):(

         <button

          className="btn"

          style={{marginLeft:"10px"}}

          onClick={()=>unpinPost(p._id)}

         >

          Unpin

         </button>

        )}



       </div>

      )}



     </div>

    ))}

   </div>



  </div>

 );

}