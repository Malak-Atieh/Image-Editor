import { useLocation, useNavigate,Link } from "react-router-dom";
import Cropper from "react-easy-crop";
import { useState, useCallback } from "react";
import getCroppedImg from "../utils/cropImage";
import { Crop, Contrast} from 'lucide-react';

const aspectRatios = [
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
  { label: "1:1", value: 1 },
  { label: "5:4", value: 5 / 4 },
  { label: "6:4", value: 6 / 4 },
  { label: "7:5", value: 7 / 5 },
];

const CropImage = () =>{
  const location = useLocation();
  const navigate = useNavigate();
  const imageSrc = location.state?.image;
  const adjustments = location.state?.adjustments || {};

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(4 / 3);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false);

  const getFilterStyle = () => ({
    filter: `
      brightness(${adjustments.brightness || 100}%)
      contrast(${adjustments.contrast || 100}%)
      saturate(${adjustments.saturation || 100}%)
      sepia(${adjustments.sepia || 0}%)
      grayscale(${adjustments.grayscale || 0}%)
    `
  });

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  if (!imageSrc) return <p className="text-center mt-10 text-red-500">No image provided.</p>;
  
  /*const handleSave= async () => {
    try {
      // Get the image element properly
          if (!imageRef.current) {
      throw new Error('Image reference not available');
    }

    const imgElement = imageRef.current;

    // Wait for image to load if needed
    if (!imgElement.complete) {
      await new Promise((resolve, reject) => {
        imgElement.onload = resolve;
        imgElement.onerror = () => reject(new Error('Image failed to load'));
      });
    }
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = imgElement.naturalWidth;
      canvas.height = imgElement.naturalHeight;
      
      const ctx = canvas.getContext('2d');
      
      // Apply current filters from computed style
      const computedStyle = window.getComputedStyle(imgElement);
      ctx.filter = computedStyle.filter || 'none';
      
      // Draw the image
      ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
      
      // Get the base64 data
      const extension = imageSrc.split('.').pop().toLowerCase();
      const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
      const base64 = canvas.toDataURL(mimeType, 0.92);

      const saveData = {
        originalPath: location.state?.originalPath || imageSrc,
        base64Data: base64, 
        title: `Edited_${Date.now()}`,
        type: mimeType
      };

      // Send to main process
      const result = await window.myAPI.editImage(saveData);
  
      if (result.success) {
        alert('Image saved successfully!');
        navigate('/gallery');
      } else {
        throw new Error(result.error || 'Failed to save image');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert(`Save failed: ${error.message}`);
    }
  };*/
  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-purple-600 mb-6">Crop Image</h1>
        <div className="flex gap-4">
          <button 
            className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600"
            onClick={console.log("saved")}
          >
            Save
          </button>
          <button 
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-400"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
      </div>
      <div className="flex gap-10 w-full max-w-5xl">
      <div className="w-16 flex flex-col items-center gap-4 py-4 bg-white rounded-xl shadow">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Link to={"/crop"}   >
              <Crop  size={20} />
            </Link>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Link to={"/edit"} state={{ image: imageSrc, croppedImage: croppedAreaPixels }}>
            <Contrast  size={20} />
            </Link>
          </button>
        </div>
      <div className="flex-1 p-4 flex object-contain relative w-full max-w-xl h-[400px] bg-black rounded-xl overflow-hidden shadow-md ml-20">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          style={getFilterStyle()}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          showGrid={true}
        />
      </div>
      </div>
      <div className="w-full max-w-xl mt-6">
        <label className="text-gray-700 font-medium block mb-2">Zoom</label>
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(e.target.value)}
          className="w-full accent-purple-600"
        />
      </div>

      <div className="flex flex-wrap gap-3 mt-6 justify-center">
        {aspectRatios.map((r) => (
          <button
            key={r.label}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
              aspect === r.value
                ? "bg-purple-600 text-white border-purple-600"
                : "border-purple-300 text-purple-700 hover:bg-purple-100"
            }`}
            onClick={() => setAspect(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>

      
    </div>
  );
};
export default CropImage;
