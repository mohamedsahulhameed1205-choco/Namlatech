import { configureStore } from "@reduxjs/toolkit";
import hotelReducer from "./hotelSlice";

const store = configureStore({
  reducer: {
    hotels: hotelReducer
  }
});

export default store;