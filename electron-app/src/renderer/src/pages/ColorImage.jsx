import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const FILTER_CLASSES = {
  none: "",
  bw: "filter-bw",
  bwCool: "filter-bwCool",
  bwWarm: "filter-bwWarm",
  film: "filter-film",
  punch: "filter-punch",
};

const filterOptions = [
  { key: "none", name: "Original" },
  { key: "bw", name: "B&W" },
  { key: "bwCool", name: "B&W Cool" },
  { key: "bwWarm", name: "B&W Warm" },
  { key: "film", name: "Film" },
  { key: "punch", name: "Punch" },
];

const ColorImage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const imageSrc = location.state?.image;

    const [selectedFilter, setSelectedFilter] = useState("none");

    return (

        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
            <h1 className="text-2xl font-bold text-purple-600 mb-6">Crop Image</h1>
  
            <div className="space-x-2">
              <button className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600">Save</button>
              <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-400">Back</button>
            </div>
  
          <div className="flex gap-6">
            <div className="w-12 flex flex-col items-center gap-4 py-4 bg-white rounded-xl shadow">
              <button>🖼️</button>
              <button>✂️</button>
              <button>📐</button>
              <button>🎛️</button>
            </div>
  
            <div className="flex-1 bg-white rounded-xl shadow p-4 flex justify-center items-center">
              <img
                src={imageSrc}
                alt="Main"
                className={`max-h-[500px] object-contain rounded-xl transition duration-300 ${FILTER_CLASSES[selectedFilter]}`}
              />
            </div>
  
            <div className="w-64 bg-white rounded-xl shadow p-4">
              <div className="flex gap-4 mb-4">
                <button className="text-purple-600 font-semibold border-b-2 border-purple-600">Filter</button>
                <button className="text-gray-400 font-semibold">Adjust</button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {filterOptions.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setSelectedFilter(filter.key)}
                    className={`text-xs rounded-md p-1 border ${
                      selectedFilter === filter.key ? "border-purple-500" : "border-transparent"
                    }`}
                  >
                    <div className={`w-full h-16 overflow-hidden rounded-md`}>
                      <img
                        src={imageSrc}
                        alt={filter.name}
                        className={`w-full h-full object-cover ${FILTER_CLASSES[filter.key]}`}
                      />
                    </div>
                    <p className="mt-1 text-center">{filter.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

  );
};

export default ColorImage;
