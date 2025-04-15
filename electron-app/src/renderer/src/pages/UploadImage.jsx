import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const UploadImage = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [title, setTitle] = useState("");
  const navigate = useNavigate();
  const [fileData, setFileData] = useState(null);
  const fileInputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    previewImage(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    previewImage(file);
  };

  const previewImage = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFileData({
        base64: reader.result, 
        originalName: file.name,
        type: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!fileData || !title) return alert("Please provide an image and a title.")
    
    const result = await window.myAPI.saveImage({
      title,
      ...fileData,
    })
  
    if (result.success) {
      navigate("/gallery");
      alert("Image saved successfully!")
    } else {
      alert("Failed to save image.")
    }
  }

  return (
    <div className="p-4 bg-white  rounded-xl mb-4 flex gap-6">
      {/* Drop area */}
      <div
        className="w-2/3 border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col justify-center items-center text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {imagePreview ? (
          <img src={imagePreview} alt="Preview" className="max-w-full max-h-64 rounded-lg" />
        ) : (
          <>
            <div className="text-purple-500 text-6xl mb-4">☁️</div>
            <p className="text-lg text-gray-600">Drag images to upload</p>
            <button
              className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-full"
              onClick={() => fileInputRef.current.click()}
            >
              Select images to upload
            </button>
            <input
              type="file"
              accept="image/*"
              hidden
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </>
        )}
      </div>

      {/* Title input */}
      <div className="w-1/3 flex flex-col justify-between">
        <div>
          <h2 className="text-sm font-semibold text-red-500 mb-1">* Title your upload</h2>
          <input
            type="text"
            placeholder="Enter a short title that describes your upload"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs p-2 border border-gray-300 rounded"
          />
          <p className="text-xs text-gray-500 mt-2">
            The title will appear in gallery while browsing your images, you can search through your images using this title so make it meaningful and targeted to this specific picture!          
          </p>
        </div>
        <button
          onClick={handleUpload}
          className="mt-4 bg-purple-500 text-white py-2 px-6 rounded-full hover:bg-purple-600"
        >
          ⬆️ Upload
        </button>
      </div>
    </div>
  );
};

export default UploadImage;      