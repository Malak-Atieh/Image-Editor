import {createSlice} from "@reduxjs/toolkit";

const filterSlice =createSlice({
    name: "filter",
    initialState:{
        selectedTab:"filter",
        selectedFilter: "none",
        adjustments:{
            brightness: 100,
            contrast: 100,
            saturation: 100,
            sepia: 0,
            grayscale: 0
        }
    },
    reducers:{
        setTab: (state, action)=>{
            state.selectedTab=action.payload;
        },
        setFilter: (state, action)=>{
            state.selectedFilter=action.payload.key;
            state.adjustments=action.payload.values;
        },
        updateAdjustment: (state, action) =>{
            const { property, value } = action.payload;
            if (state.adjustments && property in state.adjustments) {
                state.adjustments[property] = value;
                state.selectedFilter = "none"; // override preset since it’s now custom
            }
        },
        resetFilters: (state)=>{
            return initialState;
        }
    }
})

export const {setTab, 
                setFilter, 
                updateAdjustment,
                resetFilters
             } = filterSlice.actions;

export default filterSlice;