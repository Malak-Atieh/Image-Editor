import { configureStore } from "@reduxjs/toolkit";
import { createLogger } from "redux-logger";
//import usersSlice from "./users/slice";
//import cropSlice from "./crop/slice";
//import filterSlice from "./filter/slice";
import imageEditorSlice from "./imageEditor/slice";

const logger = createLogger();

const store = configureStore({
  reducer: {
    imageEditor: imageEditorSlice.reducer,

  },
  middleware: (defaultMiddleware) => defaultMiddleware().concat(logger),
});

export default store;
