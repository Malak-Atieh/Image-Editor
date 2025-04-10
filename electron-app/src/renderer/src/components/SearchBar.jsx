import { useNavigate } from "react-router-dom";


const SearchBar = () => {
  const navigate = useNavigate();
const handleUpload = () => {
  navigate("/upload");
};

  return (
    <div className="flex items-center justify-between mb-6">
      <input
        type="text"
        placeholder="Search"
        className="w-full p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
      <button onClick={handleUpload} className="ml-4 px-6 py-2 bg-purple-500 text-white rounded-full shadow hover:bg-purple-600 transition">
        Upload
      </button>
    </div>
  );
};

export default SearchBar;
