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
    { key: "bwCool", name: "B&W Cool" },
    { key: "bwWarm", name: "B&W Warm" },
    { key: "film", name: "Film" },
    { key: "punch", name: "Punch" },
  ];

