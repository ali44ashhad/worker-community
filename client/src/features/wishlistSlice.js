import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
axios.defaults.withCredentials = true;

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/user/check-auth`);
      const ids = res.data?.user?.wishlist || [];
      return ids.map((id) => (typeof id === 'string' ? id : id?._id)).filter(Boolean);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load wishlist");
    }
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/add",
  async (serviceId, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/api/user/wishlist/${serviceId}`);
      const ids = (res.data?.wishlist || []).map((s) => (typeof s === 'string' ? s : s?._id)).filter(Boolean);
      return ids;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add to wishlist");
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/remove",
  async (serviceId, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`${API_URL}/api/user/wishlist/${serviceId}`);
      const ids = (res.data?.wishlist || []).map((s) => (typeof s === 'string' ? s : s?._id)).filter(Boolean);
      return ids;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to remove from wishlist");
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: { ids: [], isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ids = action.payload || [];
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.ids = action.payload || state.ids;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.ids = action.payload || state.ids;
      });
  },
});

export default wishlistSlice.reducer;


