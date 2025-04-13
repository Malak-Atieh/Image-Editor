import { configureStore } from "@reduxjs/toolkit";
import { createLogger } from "redux-logger";
//import usersSlice from "./users/slice";
//import cropSlice from "./crop/slice";
import filterSlice from "./filter/slice";

const logger = createLogger();

const store = configureStore({
  reducer: {
    filter: filterSlice.reducer,
    //crop: cropSlice.reducer,
    //users: usersSlice.reducer,
  },
  middleware: (defaultMiddleware) => defaultMiddleware().concat(logger),
});

export default store;
