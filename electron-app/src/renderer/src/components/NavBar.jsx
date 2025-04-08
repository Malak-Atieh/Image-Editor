import logo from '../assets/logo-design.png';
import profile from '../assets/profile.jpg'

const Navbar = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-white shadow rounded-xl mb-4">
      <div className="flex items-center gap-10">
        <div className="text-2xl font-bold text-purple-600 w-10 h-10 "> <img src={logo} alt="logo" /></div>
        <div className="flex gap-8 text-gray-400 text-xl">
          <span className=" text-purple-500 pb-1">🖼️</span>
          <span>📁</span>
          <span>📸</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-medium">Jermaine Johnson</span>
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
