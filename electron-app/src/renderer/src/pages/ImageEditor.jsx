import { useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import { Crop, Contrast } from 'lucide-react';
import { 
  setActiveTool,
  setFilter, 
  updateAdjustment,
  updateCropSettings
} from '../redux/imageEditor/slice';
import { 
  filterPresets, 
  filterOptions,
  aspectRatios 
} from '../utils/filterPresets';
import getCroppedImg from '../utils/cropImage';

const ImageEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const imageRef = useRef();
  const [loading, setLoading] = useState(false);

  // Get state from Redux
  const { 
    activeTool,
    selectedFilter, 
    adjustments,
    cropSettings
  } = useSelector((state) => state.imageEditor);
  
  // Image data from location state
  const imageSrc = location.state?.image;
  const rawTitle = location.state?.title || 'image';
  const originalPath = location.state?.path;
  const title = typeof rawTitle === 'string' ? rawTitle : 'image';
  const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');

  // Combined filter style
  const getFilterStyle = () => ({
    filter: `
      brightness(${adjustments.brightness}%)
      contrast(${adjustments.contrast}%)
      saturate(${adjustments.saturation}%)
      sepia(${adjustments.sepia}%)
      grayscale(${adjustments.grayscale}%)
    `,
    transition: "filter 0.3s ease"
  });

  // Crop handler
  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    dispatch(updateCropSettings({ croppedAreaPixels }));
  }, [dispatch]);

  // Save handle
  const handleSave = async () => {
    try {
      const userString = localStorage.getItem("user");
    if (!userString) {
      alert("Please log in to view images");
      navigate("/login");
      return ;
    }

    
    const user = JSON.parse(userString);
    if (!user?.id) {
      throw new Error("Invalid user data");
    }    
      setLoading(true);
      
       // Get cropped image first if in crop mode
      let processedImage = imageSrc;
      if (activeTool === 'crop' && cropSettings.croppedAreaPixels) {
        processedImage = await getCroppedImg(
        imageSrc,
        cropSettings.croppedAreaPixels
        );
      }

      // Create new image element to apply filters
      const img = new Image();
      img.src = processedImage;
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Image failed to load'));
      });

  
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
  
      // Apply current filters
      ctx.filter = `
        brightness(${adjustments.brightness}%)
        contrast(${adjustments.contrast}%)
        saturate(${adjustments.saturation}%)
        sepia(${adjustments.sepia}%)
        grayscale(${adjustments.grayscale}%)
      `;
      ctx.drawImage(img, 0, 0);

      // Get base64 data
      const mimeType = imageSrc.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
      const base64Data = canvas.toDataURL(mimeType, 0.92);
  
      // Prepare save data
      const saveData = {
        userId: String(user.id),
        originalPath: originalPath || imageSrc,
        base64Data,
        title: `${safeTitle}_edited_${Date.now()}`,
        type: mimeType
      };
  
      // Send to main process
      const result = await window.myAPI.editImage(saveData);
      if (result.success) {
        alert(`Image saved successfully at ${result.path}`);
        navigate('/gallery', { state: { newImage: result.path } });
    } else {
        throw new Error(result.error || 'Failed to save image');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert(`Save failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-purple-600">
          {activeTool === 'crop' ? 'Crop Image' : 'Image Adjustments'}
        </h1>
        
        <div className="flex gap-4">
          <button 
            className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button 
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-400"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
      </div>

      <div className="flex gap-6 w-full max-w-6xl">
        {/* Tools sidebar */}
        <div className="w-16 flex flex-col items-center gap-4 py-4 bg-white rounded-xl shadow">
          <button 
            className={`p-2 rounded-lg ${activeTool === 'crop' ? 'bg-purple-100' : 'hover:bg-gray-100'}`}
            onClick={() => dispatch(setActiveTool('crop'))}
          >
            <Crop size={20} />
          </button>
          <button 
            className={`p-2 rounded-lg ${activeTool === 'filter' ? 'bg-purple-100' : 'hover:bg-gray-100'}`}
            onClick={() => dispatch(setActiveTool('filter'))}
          >
            <Contrast size={20} />
          </button>
        </div>

        {/* Main image area */}
        <div className="flex-1 p-4 bg-white rounded-xl shadow flex justify-center items-center">
          {activeTool === 'crop' ? (
            <div className="relative w-full h-[500px]">
              <Cropper
                image={imageSrc}
                crop={cropSettings.crop}
                zoom={cropSettings.zoom}
                aspect={cropSettings.aspect}
                onCropChange={(crop) => dispatch(updateCropSettings({ crop }))}
                onZoomChange={(zoom) => dispatch(updateCropSettings({ zoom }))}
                onCropComplete={onCropComplete}
                showGrid={true}
                style={getFilterStyle()}
              />
            </div>
          ) : (
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Edited Preview"
              style={getFilterStyle()}
              crossOrigin="anonymous"
              className="max-h-[500px] max-w-full object-contain rounded-xl"
            />
          )}
        </div>

        {/* Settings panel */}
        <div className="w-80 bg-white rounded-xl shadow p-4">
          {activeTool === 'crop' ? (
            <>
              <div className="mb-6">
                <label className="text-gray-700 font-medium block mb-2">Zoom</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={cropSettings.zoom}
                  onChange={(e) => dispatch(updateCropSettings({ zoom: parseFloat(e.target.value) }))}
                  className="w-full accent-purple-600"
                />
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                {aspectRatios.map((r) => (
                  <button
                    key={r.label}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                      cropSettings.aspect === r.value
                        ? "bg-purple-600 text-white border-purple-600"
                        : "border-purple-300 text-purple-700 hover:bg-purple-100"
                    }`}
                    onClick={() => dispatch(updateCropSettings({ aspect: r.value }))}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-4 mb-4 border-b">
                <button
                  className={`pb-2 font-semibold ${
                    selectedFilter 
                      ? "text-purple-600 border-b-2 border-purple-600" 
                      : "text-gray-400"
                  }`}
                  onClick={() => dispatch(setFilter({ key: 'none', values: filterPresets.none }))}
                >
                  Filters
                </button>
                <button
                  className={`pb-2 font-semibold ${
                    !selectedFilter
                      ? "text-purple-600 border-b-2 border-purple-600" 
                      : "text-gray-400"
                  }`}
                  onClick={() => dispatch(setFilter(null))}
                >
                  Adjustments
                </button>
              </div>

              {selectedFilter ? (
                <div className="grid grid-cols-3 gap-3">
                  {filterOptions.map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => dispatch(setFilter({ 
                        key: filter.key, 
                        values: filterPresets[filter.key] 
                      }))}
                      className={`flex flex-col items-center p-2 rounded-lg transition ${
                        selectedFilter === filter.key 
                          ? "bg-purple-100 border border-purple-300" 
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="w-full h-16 overflow-hidden rounded-md mb-1">
                        <img
                          src={imageSrc}
                          alt={filter.name}
                          style={{ 
                            filter: `
                              brightness(${filterPresets[filter.key].brightness}%)
                              contrast(${filterPresets[filter.key].contrast}%)
                              saturate(${filterPresets[filter.key].saturation}%)
                              sepia(${filterPresets[filter.key].sepia}%)
                              grayscale(${filterPresets[filter.key].grayscale}%)
                            `
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs font-medium">{filter.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { label: "Brightness", property: "brightness", min: 50, max: 150 },
                    { label: "Contrast", property: "contrast", min: 50, max: 150 },
                    { label: "Saturation", property: "saturation", min: 0, max: 200 },
                    { label: "Sepia", property: "sepia", min: 0, max: 100 },
                    { label: "Grayscale", property: "grayscale", min: 0, max: 100 }
                  ].map((slider) => (
                    <div key={slider.property}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{slider.label}</span>
                        <span>{adjustments[slider.property]}%</span>
                      </div>
                      <input
                        type="range"
                        min={slider.min}
                        max={slider.max}
                        value={adjustments[slider.property]}
                        onChange={(e) => dispatch(updateAdjustment({
                          property: slider.property,
                          value: parseInt(e.target.value)
                        }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;