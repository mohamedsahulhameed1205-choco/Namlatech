import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "http://localhost:5000/api/hotels";

// Get all hotels
export const fetchHotels = createAsyncThunk(
  "hotels/fetchHotels",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(API, {
        params: {
          limit: 1000,
          offset: 0
        }
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Unable to fetch hotels");
    }
  }
);

// Add hotel
export const addHotel = createAsyncThunk(
  "hotels/addHotel",
  async (formData, thunkAPI) => {
    try {
      const token = localStorage.getItem("stayfinderToken");

      const response = await axios.post(API, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to add hotel"
      );
    }
  }
);

// Update hotel
export const updateHotel = createAsyncThunk(
  "hotels/updateHotel",
  async ({ id, formData }, thunkAPI) => {
    try {
      const token = localStorage.getItem("stayfinderToken");

      const response = await axios.put(`${API}/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to update hotel"
      );
    }
  }
);

// Delete hotel
export const deleteHotel = createAsyncThunk(
  "hotels/deleteHotel",
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem("stayfinderToken");

      await axios.delete(`${API}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return id;

    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to delete hotel"
      );
    }
  }
);

const unwrapHotel = (payload) => {
  if (!payload) return null;

  if (payload.hotel) return payload.hotel;
  if (payload.data?.hotel) return payload.data.hotel;
  if (payload.data && payload.data.id) return payload.data;
  if (payload.id) return payload;

  return null;
};

const hotelSlice = createSlice({
  name: "hotels",

  initialState: {
    hotels: [],
    loading: false,
    error: null
  },

  reducers: {
    clearHotelError: (state) => {
      state.error = null;
    }
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels = action.payload;
      })

      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addHotel.fulfilled, (state, action) => {
        const savedHotel = unwrapHotel(action.payload);
        if (savedHotel) {
          state.hotels.unshift(savedHotel);
        }
      })

      .addCase(addHotel.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(updateHotel.fulfilled, (state, action) => {
        const updatedHotel = unwrapHotel(action.payload);
        if (!updatedHotel) return;

        const index = state.hotels.findIndex(
          (hotel) => hotel.id === updatedHotel.id
        );

        if (index !== -1) {
          state.hotels[index] = updatedHotel;
        }
      })

      .addCase(updateHotel.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(deleteHotel.fulfilled, (state, action) => {
        state.hotels = state.hotels.filter(
          (hotel) => hotel.id !== action.payload
        );
      })

      .addCase(deleteHotel.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { clearHotelError } = hotelSlice.actions;

export default hotelSlice.reducer;