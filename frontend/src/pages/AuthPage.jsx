import axios from "axios";
import { useState } from "react";
import "../index.css";

export default function AuthPage(){

 const [isLogin,setIsLogin] = useState(true);

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

  if(!data.email || !data.password){

   alert("Fill required fields");

   return;

  }

  if(!isLogin){

   if(data.password !== data.confirmPassword){

    alert("Passwords do not match");

    return;

   }

  }

  try{

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



    alert("Account created successfully");



    setIsLogin(true);

   }

  }

  catch(err){

   console.log(err);

   alert("Error");

  }

 };



 return(

  <div className="app-shell" style={{maxWidth:450}}>

   <div className="hero">

    <h1>

     {isLogin ? "Login" : "Create Student Account"}

    </h1>

   </div>



   <div className="section-card stack">

    {!isLogin && (

     <>

      <input

       className="input"

       placeholder="Username"

       onChange={e=>setData({

        ...data,

        username:e.target.value

       })}

      />



      <input

       className="input"

       placeholder="Full Name"

       onChange={e=>setData({

        ...data,

        fullName:e.target.value

       })}

      />



      <input

       className="input"

       placeholder="College Name"

       onChange={e=>setData({

        ...data,

        college:e.target.value

       })}

      />



      <select

 className="input"

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

       onChange={e=>setData({

        ...data,

        year:e.target.value

       })}

      >

       <option>Select Year</option>

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

     onChange={e=>setData({

      ...data,

      email:e.target.value

     })}

    />



    <input

     className="input"

     type="password"

     placeholder="Password"

     onChange={e=>setData({

      ...data,

      password:e.target.value

     })}

    />



    {!isLogin && (

     <input

      className="input"

      type="password"

      placeholder="Confirm Password"

      onChange={e=>setData({

       ...data,

       confirmPassword:e.target.value

      })}

     />

    )}



    <button

     className="btn"

     onClick={handleSubmit}

    >

     {isLogin ? "Login" : "Create Account"}

    </button>



    <button

     className="btn secondary"

     onClick={()=>setIsLogin(!isLogin)}

    >

     {isLogin ? "New Student?" : "Already have account?"}

    </button>

   </div>

  </div>

 );

}