import Navbar from './components/NavBar';
import {Routes, Route, useLocation } from "react-router-dom";
import Home from './pages/Home';
import UploadImage from './pages/UploadImage';
import EditImage from "./pages/EditImage";

function App() {
  const { pathname } = useLocation();

  return (   
  <>       
     
    {pathname !== "/login" &&<Navbar />}
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/upload" element={<UploadImage />} />
          <Route path="/edit" element={<EditImage />} />
        </Routes>

  </>
  );
}

export default App;
