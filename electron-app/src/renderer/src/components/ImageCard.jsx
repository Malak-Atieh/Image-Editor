import { useNavigate } from "react-router-dom";

const ImageCard = ({ src,path, title }) => {
  
const navigate = useNavigate();
const handleEdit = () => {
  navigate("/edit", { state: { image: src } });
};
const handleDelete = async () => {
  const confirmDelete = window.confirm("Are you sure you want to delete this image?");
  if (!confirmDelete) return;

  const result = await window.myAPI.deleteImage(path);
  if (result.success) {
    alert("Image deleted successfully!");
    window.location.reload();
  } else {
    alert("Failed to delete image.");
  }
};
    return (
      <div className="relative group overflow-hidden rounded-xl">
        <img src={src} alt={title} className="w-full h-full object-cover" />
        {title && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <div className="text-white text-center space-y-2">
              <p className="text-lg font-semibold">{title}</p>
              <div className="flex justify-center gap-4">
                <button onClick={handleEdit} className="bg-white text-black px-2 py-1 rounded-full hover:bg-gray-200">✏️</button>
                <button onClick={handleDelete} className="bg-red-500 text-white px-2 py-1 rounded-full hover:bg-red-600">🗑️</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default ImageCard;