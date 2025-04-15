import { useLocation, useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import { useState, useCallback } from "react";
import getCroppedImg from "../utils/cropImage";

const aspectRatios = [
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
  { label: "1:1", value: 1 },
  { label: "5:4", value: 5 / 4 },
  { label: "6:4", value: 6 / 4 },
  { label: "7:5", value: 7 / 5 },
];

export default function EditImage() {
  const location = useLocation();
  const navigate = useNavigate();
  const imageSrc = location.state?.image;

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(4 / 3);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropDone = async () => {
    setLoading(true);
    try {
      const croppedImgUrl = await getCroppedImg(imageSrc, croppedAreaPixels);
      navigate("/gallery", { state: { croppedImage: croppedImgUrl } });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (!imageSrc) return <p className="text-center mt-10 text-red-500">No image provided.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-purple-600 mb-6">Crop Image</h1>

      <div className="relative w-full max-w-3xl h-[400px] bg-black rounded-xl overflow-hidden shadow-md">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          showGrid={true}
        />
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

      <div className="mt-8 flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 rounded-full bg-gray-400 text-white hover:bg-gray-500 transition"
        >
          Back
        </button>
        <button
          onClick={handleCropDone}
          className="px-6 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
