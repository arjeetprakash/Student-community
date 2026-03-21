import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Notices from "./pages/Notices";

function App(){

  return(

    <Routes>

      <Route path="/" element={<Dashboard/>}/>
      <Route path="/profile" element={<Profile/>}/>
      <Route path="/notices" element={<Notices/>}/>

    </Routes>

  );

}

export default App;