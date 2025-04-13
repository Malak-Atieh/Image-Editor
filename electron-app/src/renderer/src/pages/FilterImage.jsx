import { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from "react-router-dom";
import { setTab, setFilter, updateAdjustment } from '../redux/filter/slice';
import { filterPresets, filterOptions } from '../redux/filter/filterPresets';

const FilterImage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch =useDispatch();
  const imageSrc = location.state?.image;
  const imageRef = useRef();

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

  const handleSave = async () => {
    try {
      // 1. Get the edited image as base64
      const canvas = document.createElement('canvas');
      const img = document.querySelector('.edited-image'); // Your image element
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.filter = getComputedStyle(img).filter; // Apply current filters
      ctx.drawImage(img, 0, 0);
      
      const editedBase64 = canvas.toDataURL('image/jpeg', 0.9); // Adjust quality
  
      // 2. Send to main process
      const result = await window.electronAPI.saveEditedImage({
        originalPath: location.state.originalPath, // Pass original path
        editedBase64,
        title: `Edited ${location.state.title}`,
        type: 'image/jpeg'
      });
  
      if (result.success) {
        alert('Image saved successfully!');
        navigate('/gallery'); // Or wherever you want to go
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

      <div className="flex gap-6 w-full max-w-6xl">
        <div className="w-16 flex flex-col items-center gap-4 py-4 bg-white rounded-xl shadow">
          <button className="p-2 hover:bg-gray-100 rounded-lg">🖼️</button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">✂️</button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">📐</button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">🎛️</button>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow p-4 flex justify-center items-center">
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Main"
            style={getFilterStyle()}
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