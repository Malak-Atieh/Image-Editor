import ImageCard from "./ImageCard";
import { useEffect, useState } from 'react';

const Gallery = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      const rawImages = await window.myAPI.fetchImages();
  
      const withUrls = await Promise.all(
        rawImages.map(async (img) => {
          try {
            const dataUrl = await window.myAPI.getImageDataUrl(img.path);
            return {
              ...img,
              src: dataUrl,
            };
          } catch (error) {
            console.warn(`Skipping image at ${img.path}:`, error.message);
            return null; // Image missing or failed to load
          }
        })
      );
      const validImages = withUrls.filter((img) => img !== null);

      setImages(validImages);
    };
  
    fetchImages();
  }, []);


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((img, index) => (
        <ImageCard key={index} src={img.src} title={img.title} path={img.path}/>
      ))}
    </div>
  );
};

export default Gallery; 