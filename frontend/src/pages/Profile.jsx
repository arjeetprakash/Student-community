import axios from "axios";
import { useEffect,useState } from "react";
import Navbar from "../components/Navbar";

export default function Profile(){

 const [user,setUser]=useState({});

 const [posts,setPosts]=useState([]);

 const [editId,setEditId]=useState(null);

 const [editTitle,setEditTitle]=useState("");

 const [editContent,setEditContent]=useState("");

 const [file,setFile]=useState(null);

 const role=localStorage.getItem("role");



 useEffect(()=>{

  loadData();

 },[]);



 const loadData=()=>{

  const token=localStorage.getItem("token");



  axios.get(

   "http://localhost:5000/api/auth/me",

   {

    headers:{Authorization:`Bearer ${token}`}

   }

  )
  .then(res=>setUser(res.data));



  axios.get(

   "http://localhost:5000/api/post/myposts",

   {

    headers:{Authorization:`Bearer ${token}`}

   }

  )
  .then(res=>setPosts(res.data));

 };



 /* PROFILE PHOTO */

 const uploadPhoto=async()=>{

  const token=localStorage.getItem("token");



  const formData=new FormData();

  formData.append("file",file);



  await axios.put(

   "http://localhost:5000/api/auth/upload-photo",

   formData,

   {

    headers:{Authorization:`Bearer ${token}`}

   }

  );



  loadData();

 };



 /* DELETE OWN POST */

 const deleteOwnPost=async(id)=>{

  const token=localStorage.getItem("token");



  await axios.delete(

   `http://localhost:5000/api/post/user/${id}`,

   {

    headers:{Authorization:`Bearer ${token}`}

   }

  );



  loadData();

 };



 /* EDIT POST */

 const updatePost=async(id)=>{

  const token=localStorage.getItem("token");



  await axios.put(

   `http://localhost:5000/api/post/${id}`,

   {

    title:editTitle,

    content:editContent

   },

   {

    headers:{Authorization:`Bearer ${token}`}

   }

  );



  setEditId(null);

  loadData();

 };



 return(

  <div className="app-shell">

   <Navbar role={role}/>



   <div className="hero">

    <h1>My Profile</h1>

   </div>



   {/* PROFILE */}

   <div className="section-card stack">



    <div>

     <img

      src={

       user.profilePic

        ? `http://localhost:5000/uploads/${user.profilePic}`

        : "https://via.placeholder.com/100"

      }

      width="100"

      style={{borderRadius:"50%"}}

     />

    </div>



    <input

     type="file"

     onChange={e=>setFile(e.target.files[0])}

    />



    <button

     className="btn"

     onClick={uploadPhoto}

    >

     upload photo

    </button>



    <div>

     <strong>Full Name:</strong>

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

     {user.year}

    </div>



    <div>

     <strong>Total Posts:</strong>

     {posts.length}

    </div>



   </div>



   {/* USER POSTS */}

   <div className="hero">

    <h2>My Posts</h2>

   </div>



   <div className="grid">

    {posts.map(p=>(

     <div key={p._id} className="section-card">



      {editId===p._id ? (

       <>

        <input

         className="input"

         value={editTitle}

         onChange={e=>setEditTitle(e.target.value)}

        />



        <textarea

         className="input"

         value={editContent}

         onChange={e=>setEditContent(e.target.value)}

        />



        <button

         className="btn"

         onClick={()=>updatePost(p._id)}

        >

         save

        </button>

       </>

      ):(

       <>

        <h3>{p.title}</h3>

        <p>{p.content}</p>



        {p.file && (

         <a

          href={`http://localhost:5000/uploads/${p.file}`}

          target="_blank"

         >

          open file

         </a>

        )}

       </>

      )}



      <small>

       {

        new Date(

         p.createdAt

        ).toLocaleString()

       }

      </small>



      <div style={{marginTop:"10px"}}>



       <button

        className="btn secondary"

        onClick={()=>deleteOwnPost(p._id)}

       >

        delete

       </button>



       <button

        className="btn"

        onClick={()=>{

         setEditId(p._id);

         setEditTitle(p.title);

         setEditContent(p.content);

        }}

       >

        edit

       </button>



      </div>



     </div>

    ))}

   </div>



  </div>

 );

}