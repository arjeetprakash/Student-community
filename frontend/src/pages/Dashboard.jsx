import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Pagination from "../components/Pagination";

export default function Dashboard(){

 const [posts,setPosts]=useState([]);
 const [title,setTitle]=useState("");
 const [content,setContent]=useState("");
 const [page,setPage]=useState(1);
 const [comment,setComment]=useState({});
 const [search,setSearch]=useState("");
 const [onlyMine,setOnlyMine]=useState(false);
 const [loading,setLoading]=useState(true);
 const [status,setStatus]=useState("");

 const postsPerPage=5;

 const role=localStorage.getItem("role");
 const username=localStorage.getItem("username");


 // LOAD POSTS
 useEffect(()=>{

  loadPosts();

 },[]);


 const loadPosts=async()=>{

  try{

   setLoading(true);
   const res=await axios.get(

    "http://localhost:5000/api/post"

   );

   setPosts(res.data);
   setStatus("Feed updated");

  }
  catch(err){

   setStatus("Could not load posts");
   console.log("load error",err);

  }
  finally{
   setLoading(false);
   setTimeout(()=>setStatus(""),2000);
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
     author:username,
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
   setStatus("Posted! 🎉");

   loadPosts();

  }
  catch(err){

   setStatus("Post failed");
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

   setStatus("Like failed");
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

   setStatus("Comment added");
   loadPosts();

  }
  catch(err){

   setStatus("Comment failed");
   console.log("comment error",err);

  }

 };


 // FILTER + ORDER
 const orderedPosts=useMemo(()=>{

  const filtered=posts.filter(p=>{

   const matchesSearch=(p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.content?.toLowerCase().includes(search.toLowerCase()) ||
    p.author?.toLowerCase().includes(search.toLowerCase()));

   const matchesMine=onlyMine ? p.author===username : true;

   return matchesSearch && matchesMine;

  });

  return [

   ...filtered.filter(p=>p.isPinned),
   ...filtered.filter(p=>!p.isPinned)

  ];

 },[posts,search,onlyMine,username]);


 // PAGINATION
 const lastIndex=page*postsPerPage;

 const firstIndex=lastIndex-postsPerPage;

 const currentPosts=orderedPosts.slice(

  firstIndex,
  lastIndex

 );


 const remainingChars=240-content.length;


 return(

 <div className="app-shell">

 <Navbar role={role}/>



 <div className="hero">

  <h1>Student Hub</h1>
  <p>Share updates, cheer peers, and pin highlights</p>

  {status && (
   <div className="toast">{status}</div>
  )}

 </div>



 {/* CREATE POST */}

 <div className="section-card stack">

  <div style={{display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap"}}>
   <input

    className="input"

    placeholder="Title"

    value={title}

    onChange={e=>setTitle(e.target.value)}

    style={{flex:1,minWidth:"200px"}}

   />

   <div className="chip">Signed in as {username || "anon"}</div>
  </div>



  <textarea

   className="input"

   placeholder="Share what is happening..."

   value={content}

   maxLength={240}

   onChange={e=>setContent(e.target.value)}

   rows={4}

  />

  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
   <small style={{color:remainingChars<20?"#dc2626":"#475569"}}>
    {remainingChars} characters left
   </small>

   <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
    <button

     className="btn"

     onClick={createPost}

    >

     Post update

    </button>

    <button
     className="btn secondary"
     onClick={loadPosts}
    >
     Refresh
    </button>
   </div>
  </div>

 </div>



 {/* FILTER BAR */}
 <div className="section-card" style={{display:"flex",gap:"12px",flexWrap:"wrap",alignItems:"center"}}>
  <input
   className="input"
   placeholder="Search by title, content, author"
   value={search}
   onChange={e=>{setSearch(e.target.value); setPage(1);} }
   style={{flex:1,minWidth:"220px"}}
  />

  <label style={{display:"flex",gap:"8px",alignItems:"center",fontWeight:600}}>
   <input
    type="checkbox"
    checked={onlyMine}
    onChange={e=>{setOnlyMine(e.target.checked); setPage(1);} }
   />
   My posts only
  </label>

  <div className="chip subtle">{orderedPosts.length} results</div>
 </div>



 {/* POSTS */}

 {loading ? (
  <div className="grid">
   {[1,2,3].map(i=>(
    <div key={i} className="section-card skeleton"/>
   ))}
  </div>
 ) : (
  <>
   {orderedPosts.length===0 && (
    <div className="section-card" style={{textAlign:"center"}}>
     <p>No posts match yet.</p>
     <small>Try changing filters or start the conversation.</small>
    </div>
   )}

   <div className="grid">

   {

    currentPosts.map(p=>(

     <div

      key={p._id}

      className="section-card"

     >

      {p.isPinned && <div className="pin">📌 Pinned</div>}



      <h3>{p.title}</h3>

      <p>{p.content}</p>



      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"6px"}}>
       <small>

        {p.author}

       </small>



       <small>

        {

         new Date(p.createdAt)

         .toLocaleString()

        }

       </small>
      </div>



      {/* LIKE */}

      <div style={{display:"flex",gap:"10px",alignItems:"center",marginTop:"12px",flexWrap:"wrap"}}>
       <button

        className="btn secondary"

        onClick={()=>likePost(p._id)}

       >

        ❤️ {p.likes?.length || 0}

       </button>



       {/* COMMENT */}

       <div style={{flex:1,minWidth:"200px"}}>
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

         style={{marginTop:"8px"}}

         onClick={()=>commentPost(p._id)}

        >

         Add Comment

        </button>
       </div>

      </div>



      {/* COMMENTS */}

      {

       p.comments?.length>0 && (
        <div className="comments">
         {p.comments.map(c=>(
          <div key={c._id} className="comment-line">
           <span>💬</span>
           <span>{c.text}</span>
          </div>
         ))}
        </div>
       )

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
  </>
 )}



 </div>

 );
}
