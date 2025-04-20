export const filterPresets = {
    none: { brightness: 100, contrast: 100, saturation: 100, sepia: 0, grayscale: 0 },
    bw: { brightness: 100, contrast: 120, saturation: 0, sepia: 0, grayscale: 100 },
    bwCool: { brightness: 110, contrast: 120, saturation: 0, sepia: 0, grayscale: 100 },
    bwWarm: { brightness: 110, contrast: 120, saturation: 0, sepia: 30, grayscale: 100 },
    film: { brightness: 100, contrast: 120, saturation: 90, sepia: 10, grayscale: 0 },
    punch: { brightness: 100, contrast: 150, saturation: 140, sepia: 0, grayscale: 0 }
  };
  
  export const filterOptions = [
    { key: "none", name: "Original" },
    { key: "bw", name: "B&W" },
    { key: "bwCool", name: "Cool B&W" },
    { key: "bwWarm", name: "Warm B&W" },
    { key: "film", name: "Film" },
    { key: "punch", name: "Vibrant" }
  ];
  
  export const aspectRatios = [
    { label: "4:3", value: 4 / 3 },
    { label: "16:9", value: 16 / 9 },
    { label: "1:1", value: 1 },
    { label: "5:4", value: 5 / 4 },
    { label: "6:4", value: 6 / 4 },
    { label: "7:5", value: 7 / 5 },
  ];