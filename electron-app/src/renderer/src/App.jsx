import Navbar from './components/NavBar';
import {Routes, Route, useLocation } from "react-router-dom";
import Home from './pages/Home';
import UploadImage from './pages/UploadImage';
//import CropImage from "./pages/CropImage";
//import FilterImage from "./pages/FilterImage";
import Login from './pages/Login';
import Chat from './components/Chat';
import SignUp from './pages/SignUp';
import ImageEditor from './pages/ImageEditor';

function App() {
  const { pathname } = useLocation();

  return (   
  <>       
     
    {pathname !== "/" && pathname !== "/signup" && <Navbar />}
        <Routes>
          <Route path="/" element={<Login />}/>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/gallery" element={<Home />}/>
          <Route path="/upload" element={<UploadImage />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/edit" element={<ImageEditor/>}/>
          {/*<Route path="/crop" element={<CropImage />} />
          <Route path="/edit" element={<FilterImage />} />
*/}
        </Routes>

  </>
  );
}

export default App;
