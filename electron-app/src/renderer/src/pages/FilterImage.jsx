import { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate, Link } from "react-router-dom";
import { setTab, setFilter, updateAdjustment } from '../redux/filter/slice';
import { filterPresets, filterOptions } from '../redux/filter/filterPresets';
import { Crop, Contrast} from 'lucide-react';

const FilterImage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch =useDispatch();
  const imageSrc = location.state?.image;
  const rawTitle = location.state?.title || 'image';
  const originalPath= location.state?.originalPath
  const title = typeof rawTitle === 'string' ? rawTitle : 'image';
  const safeTitle = title ? title.replace(/[^a-zA-Z0-9_-]/g, '_') : 'image'; 
  const imageRef = useRef();
  const croppedImage = location.state?.croppedImage;

  const {  selectedTab, selectedFilter, adjustments} 
        = useSelector(
            (state) => state.filter
        );
        
  const handleFilterSelect = (filterKey) => {
    dispatch(setFilter({
        key:filterKey,
        values: filterPresets[filterKey]
    }))
  };

  const handleTabSelect = (tab) => dispatch(setTab(tab));

  const handleAdjustmentChange = (property, value) => {
    dispatch(updateAdjustment({property, value}));
  };

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

  const handleSave= async () => {
    try {
      
      if (!imageRef.current) {
      throw new Error('Image reference not available');
    }

    const imgElement = imageRef.current;

    if (!imgElement.complete) {
      await new Promise((resolve, reject) => {
        imgElement.onload = resolve;
        imgElement.onerror = () => reject(new Error('Image failed to load'));
      });
    }

      const canvas = document.createElement('canvas');
      canvas.width = imgElement.naturalWidth;
      canvas.height = imgElement.naturalHeight;
      const ctx = canvas.getContext('2d');
      
      ctx.filter = window.getComputedStyle(imgElement).filter || 'none';
      
      ctx.drawImage(imgElement, 0, 0);
      const sanitize = (str) => str.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 20);

      const extension = sanitize(imageSrc.split('.').pop()?.toLowerCase() || 'jpg');
      const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
      const base64 = canvas.toDataURL(mimeType, 0.92);

      const fileName = `${safeTitle}_edited_${Date.now()}.${extension}`;
      const saveData = {
        originalPath: location.state?.originalPath || imageSrc,
        base64Data: base64,
        title: fileName, 
        type: mimeType
      };
      console.log(saveData);

      const result = await window.myAPI.editImage(saveData);
    
      if (result.success) {
        alert(`Image saved as ${result.fileName}`);
        navigate('/gallery', { state: { newImage: result.path } });
      } else {
        throw new Error(result.error || 'Failed to save image');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert(`Save failed: ${error.message}`);
    }
  };
  
  
  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
            <div className="w-full max-w-5xl flex justify-between items-center mb-6">

      <h1 className="text-2xl font-bold text-purple-600 mb-6">Image Adjustment</h1>

      <div className="flex gap-4 mb-6">
        <button 
          className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600"
          onClick={handleSave}
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
      <div className="flex gap-6 w-full max-w-6xl">
        <div className="w-16 flex flex-col items-center gap-4 py-4 bg-white rounded-xl shadow">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Link to={"/crop"}   
            state={{
              image: imageSrc,
              title,
              originalPath,
              adjustments: adjustments 
            }}>
              <Crop  size={20} />
            </Link>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg"><Contrast  size={20} /></button>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow p-4 flex justify-center items-center">
          <img
          id="edit"
            ref={imageRef}
            src={imageSrc}
            alt="Edited Preview"
            style={getFilterStyle()}
            crossOrigin="anonymous"
            className="max-h-[500px] max-w-full object-contain rounded-xl"
          />
        </div>

        <div className="w-80 bg-white rounded-xl shadow p-4">
          <div className="flex gap-4 mb-4 border-b">
            <button
              className={`pb-2 font-semibold ${
                selectedTab === "filter" 
                  ? "text-purple-600 border-b-2 border-purple-600" 
                  : "text-gray-400"
              }`}
              onClick={() => handleTabSelect("filter")}
            >
              Filters
            </button>
            <button
              className={`pb-2 font-semibold ${
                selectedTab === "adjust" 
                  ? "text-purple-600 border-b-2 border-purple-600" 
                  : "text-gray-400"
              }`}
              onClick={() => handleTabSelect("adjust")}
            >
              Adjustments
            </button>
          </div>

          {selectedTab === "filter" && (
            <div className="grid grid-cols-3 gap-3">
              {filterOptions.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => handleFilterSelect(filter.key)}
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
                      `}}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-medium">{filter.name}</span>
                </button>
              ))}
            </div>
          )}

          {selectedTab === "adjust" && (
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
                    onChange={(e) => handleAdjustmentChange(slider.property, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterImage;