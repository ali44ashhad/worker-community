import { createSlice, createAsyncThunk, isRejectedWithValue } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";
import { getApiBase } from "../utils/apiBase";

const API_URL = getApiBase() || "http://localhost:3001";
axios.defaults.withCredentials = true;

export const getAllProviders = createAsyncThunk(
  "provider/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/provider-profile`);
      return res.data.providers;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch providers");
    }
  }
);

export const getProviderById = createAsyncThunk(
  "provider/getById",
  async (providerProfileId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/provider-profile/${providerProfileId}`);
      return res.data.provider;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Provider not found");
    }
  }
);

export const getMyProviderProfile = createAsyncThunk(
  "provider/getMyProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/provider-profile/my-profile`);
      return res.data.provider;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch profile");
    }
  }
);

export const getProviderDashboardStats = createAsyncThunk(
  "provider/getDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/provider-profile/dashboard/stats`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch provider stats");
    }
  }
);

const initialState = {
  allProviders: [],
  selectedProvider: null,
  myProviderProfile: null,
  dashboardStats: null,
  dashboardError: null,
  isFetchingAll: false,
  isFetchingSelected: false,
  isFetchingMyProfile: false,
  isFetchingDashboard: false,
  error: null,
};

const providerSlice = createSlice({
  name: "provider",
  initialState,
  reducers: {
    clearSelectedProvider(state) {
      state.selectedProvider = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllProviders.pending, (state) => {
        state.isFetchingAll = true;
        state.error = null;
      })
      .addCase(getAllProviders.fulfilled, (state, action) => {
        state.isFetchingAll = false;
        state.allProviders = action.payload;
      })
      .addCase(getAllProviders.rejected, (state, action) => {
        state.isFetchingAll = false;
        state.error = action.payload;
      })
      .addCase(getProviderById.pending, (state) => {
        state.isFetchingSelected = true;
        state.error = null;
      })
      .addCase(getProviderById.fulfilled, (state, action) => {
        state.isFetchingSelected = false;
        state.selectedProvider = action.payload;
      })
      .addCase(getProviderById.rejected, (state, action) => {
        state.isFetchingSelected = false;
        state.error = action.payload;
      })
      .addCase(getMyProviderProfile.pending, (state) => {
        state.isFetchingMyProfile = true;
        state.error = null;
      })
      .addCase(getMyProviderProfile.fulfilled, (state, action) => {
        state.isFetchingMyProfile = false;
        state.myProviderProfile = action.payload;
      })
      .addCase(getMyProviderProfile.rejected, (state, action) => {
        state.isFetchingMyProfile = false;
        state.error = action.payload;
      })
      .addCase(getProviderDashboardStats.pending, (state) => {
        state.isFetchingDashboard = true;
        state.dashboardError = null;
      })
      .addCase(getProviderDashboardStats.fulfilled, (state, action) => {
        state.isFetchingDashboard = false;
        state.dashboardStats = action.payload;
      })
      .addCase(getProviderDashboardStats.rejected, (state, action) => {
        state.isFetchingDashboard = false;
        state.dashboardError = action.payload;
      })
      .addMatcher(isRejectedWithValue(), (state, action) => {
        if (action.payload && typeof action.type === "string" && action.type.startsWith("provider/")) {
          if (action.type === "provider/getAll/rejected" && state.allProviders.length > 0) {
            return;
          }
          toast.error(action.payload);
        }
      });
  },
});

export const { clearSelectedProvider } = providerSlice.actions;
export default providerSlice.reducer;
