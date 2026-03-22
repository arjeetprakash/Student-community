import axios from "axios";
import { useEffect,useState } from "react";
import Navbar from "../components/Navbar";
import Pagination from "../components/Pagination";

export default function Dashboard(){

 const [posts,setPosts]=useState([]);
 const [title,setTitle]=useState("");
 const [content,setContent]=useState("");
 const [page,setPage]=useState(1);
 const [comment,setComment]=useState({});

 const postsPerPage=5;

 const role=localStorage.getItem("role");



 // LOAD POSTS
 useEffect(()=>{

  loadPosts();

 },[]);



 const loadPosts=async()=>{

  try{

   const res=await axios.get(

    "http://localhost:5000/api/post"

   );

   setPosts(res.data);

  }
  catch(err){

   console.log("load error",err);

  }

 };



 // CREATE POST
 const createPost=async()=>{

  if(!title && !content) return;

  try{

   const token=localStorage.getItem("token");

   await axios.post(

    "http://localhost:5000/api/post",

    {

     title,
     content,
     author:localStorage.getItem("username"),
     role:localStorage.getItem("role")

    },

    {
     headers:{
      Authorization:`Bearer ${token}`
     }
    }

   );

   setTitle("");
   setContent("");

   loadPosts();

  }
  catch(err){

   console.log("post error",err);

  }

 };



 // LIKE POST
 const likePost=async(id)=>{

  try{

   const token=localStorage.getItem("token");

   await axios.put(

    `http://localhost:5000/api/post/like/${id}`,

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

   console.log("like error",err);

  }

 };



 // COMMENT POST
 const commentPost=async(id)=>{

  if(!comment[id]) return;

  try{

   const token=localStorage.getItem("token");

   await axios.post(

    `http://localhost:5000/api/post/comment/${id}`,

    {
     text:comment[id]
    },

    {
     headers:{
      Authorization:`Bearer ${token}`
     }
    }

   );

   setComment({

    ...comment,
    [id]:""

   });

   loadPosts();

  }
  catch(err){

   console.log("comment error",err);

  }

 };



 // PIN ORDER
 const orderedPosts=[

  ...posts.filter(p=>p.isPinned),
  ...posts.filter(p=>!p.isPinned)

 ];



 // PAGINATION
 const lastIndex=page*postsPerPage;

 const firstIndex=lastIndex-postsPerPage;

 const currentPosts=orderedPosts.slice(

  firstIndex,
  lastIndex

 );



 return(

 <div className="app-shell">

 <Navbar role={role}/>



 <div className="hero">

  <h1>Student Hub</h1>

 </div>



 {/* CREATE POST */}

 <div className="section-card stack">

  <input

   className="input"

   placeholder="title"

   value={title}

   onChange={e=>setTitle(e.target.value)}

  />



  <textarea

   className="input"

   placeholder="content"

   value={content}

   onChange={e=>setContent(e.target.value)}

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

 {

  currentPosts.map(p=>(

   <div

    key={p._id}

    className="section-card"

   >

    {p.isPinned && <div>📌 pinned</div>}



    <h3>{p.title}</h3>

    <p>{p.content}</p>



    <small>

     {p.author}

    </small>



    <small>

     {

      new Date(p.createdAt)

      .toLocaleString()

     }

    </small>



    {/* LIKE */}

    <button

     className="btn secondary"

     onClick={()=>likePost(p._id)}

    >

     ❤️ {p.likes?.length || 0}

    </button>



    {/* COMMENT */}

    <input

     className="input"

     placeholder="write comment..."

     value={comment[p._id] || ""}

     onChange={e=>

      setComment({

       ...comment,
       [p._id]:e.target.value

      })

     }

    />



    <button

     className="btn"

     onClick={()=>commentPost(p._id)}

    >

     Add Comment

    </button>



    {/* COMMENTS */}

    {

     p.comments?.map(c=>(

      <div key={c._id}>

       💬 {c.text}

      </div>

     ))

    }

   </div>

  ))

 }

 </div>



 <Pagination

  totalItems={orderedPosts.length}

  itemsPerPage={postsPerPage}

  currentPage={page}

  setCurrentPage={setPage}

 />



 </div>

 );

}