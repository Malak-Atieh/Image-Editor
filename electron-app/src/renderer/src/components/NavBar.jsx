import logo from '../assets/logo-design.png';
import profile from '../assets/profile.jpg'
import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';

const Navbar = () => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        if (storedUser.name) {
          console.log("here");
          const parsedUser = JSON.parse(storedUser);
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
        <div className="flex gap-8 text-gray-400 text-xl">
        <Link to="/gallery" className="text-purple-500 underline mb-4 block">🖼️</Link>
          <Link to="/upload" className="text-purple-500 underline">📁</Link>
          <span>📸</span>
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
