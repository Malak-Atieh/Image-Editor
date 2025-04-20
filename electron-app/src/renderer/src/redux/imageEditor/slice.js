import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeTool: 'crop', 
  selectedFilter: "none",
  adjustments: {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sepia: 0,
    grayscale: 0
  },
  cropSettings: {
    zoom: 1,
    aspect: 4/3,
    crop: { x: 0, y: 0 },
    croppedAreaPixels: null
  }
};

const imageEditorSlice = createSlice({
  name: "imageEditor",
  initialState,
  reducers: {
    setActiveTool: (state, action) => {
      state.activeTool = action.payload;
    },
    setFilter: (state, action) => {
      state.selectedFilter = action.payload.key;
      state.adjustments = action.payload.values;
    },
    updateAdjustment: (state, action) => {
      const { property, value } = action.payload;
      if (state.adjustments && property in state.adjustments) {
        state.adjustments[property] = value;
        state.selectedFilter = "none";
      }
    },
    updateCropSettings: (state, action) => {
      state.cropSettings = { ...state.cropSettings, ...action.payload };
    },
    resetEditor: () => initialState
  }
});

export const { 
  setActiveTool,
  setFilter, 
  updateAdjustment,
  updateCropSettings,
  resetEditor
} = imageEditorSlice.actions;

export default imageEditorSlice;