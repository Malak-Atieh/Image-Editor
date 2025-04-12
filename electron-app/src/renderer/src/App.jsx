import Navbar from './components/NavBar';
import {Routes, Route, useLocation } from "react-router-dom";
import Home from './pages/Home';
import UploadImage from './pages/UploadImage';
import CropImage from "./pages/CropImage";
import ColorImage from "./pages/ColorImage";

function App() {
  const { pathname } = useLocation();

  return (   
  <>       
     
    {pathname !== "/login" &&<Navbar />}
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/upload" element={<UploadImage />} />
          <Route path="/crop" element={<CropImage />} />
          <Route path="/edit" element={<ColorImage />} />

        </Routes>

  </>
  );
}

export default App;
