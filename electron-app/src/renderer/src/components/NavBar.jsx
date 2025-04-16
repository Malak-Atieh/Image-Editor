import logo from '../assets/logo-design.png';
import profile from '../assets/profile.jpg';
import { Image, Upload, Edit, Box } from 'lucide-react';
import { Link ,useLocation} from "react-router-dom";
import { useEffect, useState } from 'react';

const Navbar = () => {
  const [userName, setUserName] = useState("");
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.name) {
          setUserName(parsedUser.name);
        }
      } catch (err) {
        console.warn("Failed to parse user from localStorage", err);
      }
    }
  }, []);
  return (

    <div className="flex items-center justify-between p-4 bg-white shadow rounded-xl mb-4">
      <div className="flex items-center gap-10">
        <div className="text-2xl font-bold text-purple-600 w-10 h-10 "> <img src={logo} alt="logo" /></div>
        <div className="flex gap-8 text-gray-400 text-l">
        <Link to="/gallery" className={`flex items-center gap-1 text-l ${location.pathname === "/gallery" ? "text-purple-500" : "text-gray-400"}`}>
          <Image size={20} />
          <span>Gallery</span>
        </Link>          
        <Link to="/upload" className={`flex items-center gap-1 text-l ${location.pathname === "/upload" ? "text-purple-500" : "text-gray-400"}`}>
          <Upload  size={20} />
          <span>Upload</span>
        </Link>
        <Link to="/chat" className={`flex items-center gap-1 text-l ${location.pathname === "/chat" ? "text-purple-500" : "text-gray-400"}`}>
          <Box size={20} />
          <span>Chat</span>
        </Link>
        <span className={`flex items-center gap-1 text-l ${location.pathname === "/edit" || location.pathname === "/crop"? "text-purple-500" : "text-gray-200"}`}>
        <Edit size={20} />
        Edit
        </span>

        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-medium">{userName}</span>
        <img
          src={profile}
          alt="Profile"
          className="w-10 h-10 rounded-full"
        />
      </div>
    </div>
  );
};

export default Navbar;
