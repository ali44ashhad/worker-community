import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";
import { checkAuth, loginUser, loginWithPhoneOtp, logoutUser, signupUser } from "./authSlice";
import { getApiBase } from "../utils/apiBase";
import { shouldToastApiMessage } from "../utils/apiToast";

const API_URL = getApiBase();
axios.defaults.withCredentials = true;

const wishlistIdsFromUser = (user) =>
  (user?.wishlist || [])
    .map((id) => (typeof id === "string" ? id : id?._id))
    .filter(Boolean);

const applyWishlistFromUser = (state, user) => {
  state.ids = wishlistIdsFromUser(user);
  state.isLoading = false;
  state.error = null;
};

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
      .addCase(checkAuth.fulfilled, (state, action) => {
        applyWishlistFromUser(state, action.payload?.user);
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        applyWishlistFromUser(state, action.payload?.user);
      })
      .addCase(loginWithPhoneOtp.fulfilled, (state, action) => {
        applyWishlistFromUser(state, action.payload?.user);
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        applyWishlistFromUser(state, action.payload?.user);
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.ids = action.payload || state.ids;
        toast.success("Added to wishlist");
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        if (shouldToastApiMessage(action.payload)) toast.error(action.payload);
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.ids = action.payload || state.ids;
        toast.success("Removed from wishlist");
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        if (shouldToastApiMessage(action.payload)) toast.error(action.payload);
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.ids = [];
        state.error = null;
      });
  },
});

export default wishlistSlice.reducer;


