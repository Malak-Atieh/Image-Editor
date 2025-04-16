import ImageCard from "./ImageCard";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadImages = async () => {
      const loadedImages = await fetchImages();
      setImages(loadedImages);
    };
    loadImages();
  }, []);

  const fetchImages = async () => {
    const userString = localStorage.getItem("user");
    if (!userString) {
      alert("Please log in to view images");
      navigate("/login");
      return [];
    }

    
    const user = JSON.parse(userString);
    if (!user?.id) {
      throw new Error("Invalid user data");
    }    
    

    const rawImages = await window.myAPI.fetchImages(String(user.id));

    const withUrls = await Promise.all(
      rawImages.map(async (img) => {
        try {

          const dataUrl = await window.myAPI.getImageDataUrl({
            userId: String(user.id), 
            imagePath: img.path
          });

          return {
            ...img,
            src: dataUrl,
          };
        } catch (error) {
          console.warn(`Skipping image at ${img.path}:`, error.message);
          return null; 
        }
      })
    );
     return withUrls.filter((img) => img !== null);
 
  };

  const handleDeleteImage = async (imageData) => {
    try {
 
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user?.id) return;
      const filePath = imageData.path;

      if (!filePath) {
        console.error("No valid filePath found in imageData");
        return;
      }
      console.log("Attempting to delete:", {
        userId: String(user.id),
        filePath: filePath,
        exists: await window.myAPI.fileExists(filePath) 
      });
      const result = await window.myAPI.deleteImage({
        userId: String(user.id), 
        filePath 
      });

      if (result.success) {
        setImages(prev => prev.filter(img => img.id !== imageData.id));
      } else {
        alert(result.error || "Failed to delete image");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred while deleting");
    }
  };


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
       {images.length > 0 ? (
        images.map((img) => (
        <ImageCard key={img.id} 
        src={img.src} 
        title={img.title} 
        onDelete={() => handleDeleteImage(img)}

        />
       
      ))
    ) : (
      <div className="col-span-full text-center py-8">
        <p className="text-gray-500">No images found in your gallery</p>
      </div>
    )}
    </div>
  );
};

export default Gallery; 