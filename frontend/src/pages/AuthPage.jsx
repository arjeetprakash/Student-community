import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../lib/apiBase";
import "../index.css";

export default function AuthPage(){
 const goToHash = (path) => {
  window.location.hash = path.startsWith("/") ? path : `/${path}`;
 };

 const [authMode,setAuthMode] = useState("student");
 const [isLogin,setIsLogin] = useState(true);
 const [showPassword,setShowPassword] = useState(false);
 const [loading,setLoading] = useState(false);
 const [error,setError] = useState("");
 const [success,setSuccess] = useState("");

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

 useEffect(()=>{
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");

  if(mode === "admin"){
   setAuthMode("admin");
   setIsLogin(true);
  }

  // Warm up API connection so first login/register feels faster.
  axios.get(`${API_BASE_URL}/health`).catch(() => {});
 },[]);

 const passwordScore = useMemo(()=>{
  const value = data.password;
  let score = 0;
  if(value.length >= 8) score += 1;
  if(/[A-Z]/.test(value)) score += 1;
  if(/[0-9]/.test(value)) score += 1;
  if(/[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
 },[data.password]);

 const passwordLabel = useMemo(()=>{
  if(!data.password) return "Enter password";
  if(passwordScore <= 1) return "Weak";
  if(passwordScore <= 3) return "Medium";
  return "Strong";
 },[data.password,passwordScore]);

 const handleSubmit = async ()=>{
  setError("");
  setSuccess("");

  if(!data.email || !data.password){
   setError("Fill required fields");
   return;
  }

  if(!isLogin && data.password !== data.confirmPassword){
   setError("Passwords do not match");
   return;
  }

  try{
   setLoading(true);

   if(isLogin){
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
   email:data.email,
   password:data.password
    });

    localStorage.setItem("token",res.data.token);
    localStorage.setItem("role",res.data.role);
    localStorage.setItem("email",data.email);
    if(res.data.userId){
   localStorage.setItem("userId",res.data.userId);
    }

    if(authMode === "admin"){
   if(res.data.role !== "admin"){
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    setError("This account is not an admin account.");
    return;
   }

   goToHash("/admin");
   return;
    }

    goToHash("/home");
   } else {
    if(authMode === "admin"){
   setError("Admin accounts are managed by system setup. Please use login.");
   return;
    }

    await axios.post(`${API_BASE_URL}/api/auth/register`, data);
    setIsLogin(true);
    setSuccess("Account created. You can now log in.");
   }
  }
  catch(err){
   console.log(err);
   const backendMessage =
    typeof err?.response?.data === "string"
   ? err.response.data
   : err?.response?.data?.message;
   setError(backendMessage || "Something went wrong. Try again.");
  }
  finally{
   setLoading(false);
  }
 };

 return(
  <div className="auth-page-root">
   <div className="auth-glow" />

   <div className="auth-wrap">
    <aside className="auth-info">
   <p className="auth-kicker">Campus Access Portal</p>
   <h1>{authMode === "student" ? "Student login and onboarding" : "Admin control access"}</h1>
   <p>
    {authMode === "student"
     ? "Join discussions, follow notices, and collaborate with peers from one place."
     : "Manage community health, student updates, and official notices securely."}
   </p>

   <div className="auth-benefits">
    <article>
     <h3>{authMode === "student" ? "Peer Network" : "Moderation Tools"}</h3>
     <p>{authMode === "student" ? "Find study partners and clubs in minutes." : "Filter users, broadcast notices, and monitor activity."}</p>
    </article>
    <article>
     <h3>{authMode === "student" ? "Opportunity Feed" : "Verified Publishing"}</h3>
     <p>{authMode === "student" ? "Stay updated on events and internships." : "Push trusted announcements with role-based access."}</p>
    </article>
   </div>
    </aside>

    <section className="auth-form-card">
   <div className="auth-role-tabs">
    <button
     type="button"
     className={authMode === "student" ? "active" : ""}
     onClick={()=>{setAuthMode("student"); setError(""); setSuccess("");}}
    >
     Student
    </button>
    <button
     type="button"
     className={authMode === "admin" ? "active" : ""}
     onClick={()=>{setAuthMode("admin"); setIsLogin(true); setError(""); setSuccess("");}}
    >
     Admin
    </button>
   </div>

   <div className="auth-title-block">
    <h2>{isLogin ? `${authMode === "admin" ? "Admin" : "Student"} Login` : "Create Student Account"}</h2>
    <p>{isLogin ? "Welcome back. Enter credentials to continue." : "Register once and start connecting."}</p>
   </div>

   <div className="section-card stack auth-inner-card tab-content">
    {error && <div className="toast toast-error" role="alert" aria-live="assertive">{error}</div>}
    {success && <div className="toast toast-success" role="status" aria-live="polite">{success}</div>}

    {!isLogin && authMode === "student" && (
     <>
      <label className="auth-label" htmlFor="auth-username">Username</label>
      <input
       id="auth-username"
       className="input"
       placeholder="Username"
       value={data.username}
       onChange={e=>setData({...data,username:e.target.value})}
       autoComplete="username"
      />

      <label className="auth-label" htmlFor="auth-fullname">Full Name</label>
      <input
       id="auth-fullname"
       className="input"
       placeholder="Full Name"
       value={data.fullName}
       onChange={e=>setData({...data,fullName:e.target.value})}
       autoComplete="name"
      />

      <label className="auth-label" htmlFor="auth-college">College Name</label>
      <input
       id="auth-college"
       className="input"
       placeholder="College Name"
       value={data.college}
       onChange={e=>setData({...data,college:e.target.value})}
       autoComplete="organization"
      />

      <label className="auth-label" htmlFor="auth-branch">Branch</label>
      <select
       id="auth-branch"
       className="input"
       value={data.branch}
       onChange={e=>setData({...data,branch:e.target.value})}
      >
       <option value="">Select Branch</option>
       <option value="Computer Science and Engineering">Computer Science and Engineering</option>
       <option value="Information Technology">Information Technology</option>
       <option value="Mechanical Engineering">Mechanical Engineering</option>
       <option value="Electrical Engineering">Electrical Engineering</option>
       <option value="Civil Engineering">Civil Engineering</option>
       <option value="OTHER">OTHER</option>
      </select>

      <label className="auth-label" htmlFor="auth-year">Year</label>
      <select
       id="auth-year"
       className="input"
       value={data.year}
       onChange={e=>setData({...data,year:e.target.value})}
      >
       <option value="">Select Year</option>
       <option>1st</option>
       <option>2nd</option>
       <option>3rd</option>
       <option>4th</option>
      </select>
     </>
    )}

    <label className="auth-label" htmlFor="auth-email">Email</label>
    <input
     id="auth-email"
     className="input"
     placeholder="Email"
     type="email"
     value={data.email}
     onChange={e=>setData({...data,email:e.target.value})}
     autoComplete="email"
    />

    <label className="auth-label" htmlFor="auth-password">Password</label>
    <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
     <input
      id="auth-password"
      className="input"
      type={showPassword?"text":"password"}
      placeholder="Password"
      value={data.password}
      onChange={e=>setData({...data,password:e.target.value})}
      style={{flex:1}}
      autoComplete={isLogin ? "current-password" : "new-password"}
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

    {!isLogin && authMode === "student" && (
     <div className="password-strength-wrap">
      <div className="password-strength-track">
       <span className={`password-strength-fill strength-${passwordScore}`} />
      </div>
      <p className="field-hint">Password strength: {passwordLabel}</p>
     </div>
    )}

    {!isLogin && authMode === "student" && (
     <>
      <label className="auth-label" htmlFor="auth-confirm-password">Confirm Password</label>
      <input
       id="auth-confirm-password"
       className="input"
       type={showPassword?"text":"password"}
       placeholder="Confirm Password"
       value={data.confirmPassword}
       onChange={e=>setData({...data,confirmPassword:e.target.value})}
       autoComplete="new-password"
      />
     </>
    )}

    <button
     className="btn"
     onClick={handleSubmit}
     disabled={loading}
     type="button"
    >
     {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
    </button>

    {authMode === "student" && (
     <button
      className="btn secondary"
      onClick={()=>{setIsLogin(!isLogin); setError(""); setSuccess("");}}
      type="button"
     >
      {isLogin ? "New Student?" : "Already have account?"}
     </button>
    )}
   </div>
    </section>
   </div>
  </div>
 );
}
