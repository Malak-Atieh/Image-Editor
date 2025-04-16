import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CropImage from './CropImage';
import FilterImage from './FilterImage';

const ImageEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState('crop'); // 'crop' or 'filter'
  const [image, setImage] = useState(location.state?.image);

  const tools = [
    { id: 'crop', icon: '✂️', label: 'Crop' },
    { id: 'filter', icon: '🎨', label: 'Filters' },
    { id: 'adjust', icon: '⚙️', label: 'Adjust' }
  ];

  const handleImageUpdate = (newImage) => {
    setImage(newImage);
  };

  const handleSave = () => {
    navigate('/gallery', { state: { editedImage: image } });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex">
      {/* Left Sidebar */}
      <div className="w-16 flex flex-col items-center gap-6 py-4 bg-white rounded-xl shadow mr-4">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`p-3 rounded-full text-xl ${
              activeTool === tool.id 
                ? 'bg-purple-100 text-purple-600' 
                : 'hover:bg-gray-100'
            }`}
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 bg-white rounded-xl shadow p-6">
        {activeTool === 'crop' ? (
          <CropImage
            imageSrc={image} 
            onComplete={handleImageUpdate}
          />
        ) : (
          <FilterImage 
            imageSrc={image} 
            onComplete={handleImageUpdate}
          />
        )}

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-full bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;