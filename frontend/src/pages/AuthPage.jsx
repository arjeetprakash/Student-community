import axios from "axios";
import { useState } from "react";
import "../index.css";

export default function AuthPage(){

 const [isLogin,setIsLogin] = useState(true);
 const [showPassword,setShowPassword] = useState(false);
 const [loading,setLoading] = useState(false);
 const [error,setError] = useState("");

 const [data,setData] = useState({

  username:"",

  fullName:"",

  email:"",

  password:"",

  confirmPassword:"",

  college:"",

  branch:"",

  year:""

 });

 const handleSubmit = async ()=>{

  setError("");

  if(!data.email || !data.password){

   setError("Fill required fields");

   return;

  }

  if(!isLogin){

   if(data.password !== data.confirmPassword){

    setError("Passwords do not match");

    return;

   }

  }

  try{

   setLoading(true);

   if(isLogin){

    const res = await axios.post(

     "http://localhost:5000/api/auth/login",

     {

  email:data.email,

  password:data.password

     }

    );



    localStorage.setItem("token",res.data.token);

    localStorage.setItem("role",res.data.role);

    localStorage.setItem("email",data.email);



    window.location="/home";

   }



   else{

    await axios.post(

     "http://localhost:5000/api/auth/register",

     data

    );



    setIsLogin(true);

   }

  }

  catch(err){

   console.log(err);
   setError("Something went wrong. Try again.");

  }
  finally{
   setLoading(false);
  }

 };



 return(

  <div className="app-shell" style={{maxWidth:480}}>

   <div className="hero">

    <h1>

     {isLogin ? "Login" : "Create Student Account"}

    </h1>
    <p style={{color:"#475569"}}>
     {isLogin ? "Welcome back!" : "Join the community in minutes."}
    </p>
   </div>



   <div className="section-card stack">

    {error && <div className="toast" style={{background:"#fef2f2",border:"1px solid #fecdd3",color:"#b91c1c"}}>{error}</div>}

    {!isLogin && (

     <>

  <input

   className="input"

   placeholder="Username"

   value={data.username}

   onChange={e=>setData({

    ...data,

    username:e.target.value

   })}

  />



  <input

   className="input"

   placeholder="Full Name"

   value={data.fullName}

   onChange={e=>setData({

    ...data,

    fullName:e.target.value

   })}

  />



  <input

   className="input"

   placeholder="College Name"

   value={data.college}

   onChange={e=>setData({

    ...data,

    college:e.target.value

   })}

  />



  <select

 className="input"

 value={data.branch}

 onChange={e=>setData({

  ...data,

  branch:e.target.value

 })}

>

 <option value="">

  Select Branch

 </option>

 <option value="Computer Science and Engineering">

  Computer Science and Engineering

 </option>

 <option value="Information Technology">

  Information Technology

 </option>

 <option value="Mechanical Engineering">

  Mechanical Engineering

 </option>

 <option value="Electrical Engineering">

  Electrical Engineering

 </option>

 <option value="Civil Engineering">

  Civil Engineering

 </option>

 <option value="OTHER">

  OTHER

 </option>

</select>



  <select

   className="input"

   value={data.year}

   onChange={e=>setData({

    ...data,

    year:e.target.value

   })}

  >

   <option value="">Select Year</option>

   <option>1st</option>

   <option>2nd</option>

   <option>3rd</option>

   <option>4th</option>

  </select>

     </>

    )}



    <input

     className="input"

     placeholder="Email"

     value={data.email}

     onChange={e=>setData({

  ...data,

  email:e.target.value

     })}

    />



    <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
     <input

  className="input"

  type={showPassword?"text":"password"}

  placeholder="Password"

  value={data.password}

  onChange={e=>setData({

   ...data,

   password:e.target.value

  })}

  style={{flex:1}}

     />

     <button
  className="btn secondary"
  onClick={()=>setShowPassword(!showPassword)}
  style={{whiteSpace:"nowrap"}}
  type="button"
     >
  {showPassword ? "Hide" : "Show"}
     </button>
    </div>



    {!isLogin && (

     <input

  className="input"

  type={showPassword?"text":"password"}

  placeholder="Confirm Password"

  value={data.confirmPassword}

  onChange={e=>setData({

   ...data,

   confirmPassword:e.target.value

  })}

     />

    )}



    <button

     className="btn"

     onClick={handleSubmit}

     disabled={loading}

     type="button"

    >

     {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}

    </button>



    <button

     className="btn secondary"

     onClick={()=>{setIsLogin(!isLogin); setError("");}}

     type="button"

    >

     {isLogin ? "New Student?" : "Already have account?"}

    </button>

   </div>

  </div>

 );
}