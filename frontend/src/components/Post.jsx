import axios from "axios";
import { useState } from "react";

export default function Post({ post }) {

 const [likes,setLikes]=useState(post.likes?.length || 0);

 const [comment,setComment]=useState("");

 const [comments,setComments]=useState(post.comments || []);



 // LIKE POST
 const handleLike=async()=>{

  try{

   const token=localStorage.getItem("token");

   const res=await axios.put(

    `http://localhost:5000/api/posts/${post._id}/like`,
    {},
    {
     headers:{
      Authorization:`Bearer ${token}`
     }
    }

   );

   setLikes(res.data.likesCount);

  }
  catch(err){

   console.log(err);

  }

 };



 // ADD COMMENT
 const handleComment=async()=>{

  if(!comment) return;

  try{

   const token=localStorage.getItem("token");

   const res=await axios.post(

    `http://localhost:5000/api/posts/${post._id}/comment`,
    {
     text:comment
    },
    {
     headers:{
      Authorization:`Bearer ${token}`
     }
    }

   );

   setComments(res.data.comments);

   setComment("");

  }
  catch(err){

   console.log(err);

  }

 };



 return(

  <div className="section-card">

   <h3>{post.title}</h3>

   <p>{post.content}</p>

   <small>{post.author}</small>



   {/* LIKE */}

   <div style={{marginTop:"10px"}}>

    <button onClick={handleLike}>

     👍 Like

    </button>

    <span style={{marginLeft:"10px"}}>

     {likes} Likes

    </span>

   </div>



   {/* COMMENT */}

   <div style={{marginTop:"10px"}}>

    <input

     className="input"

     placeholder="Write comment..."

     value={comment}

     onChange={(e)=>setComment(e.target.value)}

    />

    <button onClick={handleComment}>

     Comment

    </button>

   </div>



   {/* COMMENT LIST */}

   <div style={{marginTop:"10px"}}>

    {

     comments.map((c,i)=>(

      <p key={i}>

       {c.text}

      </p>

     ))

    }

   </div>

  </div>

 );

}