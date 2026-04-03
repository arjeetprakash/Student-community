import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Notices from "./pages/Notices";
import UserSearch from "./pages/UserSearch";
import Connections from "./pages/Connections";

export default function App(){

 return(

  <Routes>

   <Route index element={<Dashboard/>}/>

   <Route path="profile" element={<Profile/>}/>

   <Route path="profile/edit" element={<EditProfile/>}/>

   <Route path="notices" element={<Notices/>}/>

   <Route path="search" element={<UserSearch/>}/>
    <Route path="connections" element={<Connections/>}/>

  </Routes>

 );
}