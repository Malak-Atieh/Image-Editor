import ImageCard from "./ImageCard";
import mountain from '../assets/mountain.jpg';
import pink from '../assets/pink.jpg';
import road from '../assets/road.jpg';
import long from '../assets/long.jpg';
import above from '../assets/above.jpg';

const images = [
  { src: mountain, title: "mountain view" },
  { src: above, title: "Above the clouds" },
  { src: road, title: "road" },
  { src: pink, title: "pink flowers" },
  { src: long, title: "long" },
  { src: mountain, title: "mountain view" },
];

const Gallery = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((img, index) => (
        <ImageCard key={index} src={img.src} title={img.title} />
      ))}
    </div>
  );
};

export default Gallery; 