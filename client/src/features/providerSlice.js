import { createSlice, createAsyncThunk, isRejectedWithValue } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";
import { getApiBase } from "../utils/apiBase";
import { shouldToastApiMessage } from "../utils/apiToast";

const API_URL = getApiBase();
axios.defaults.withCredentials = true;

export const getAllProviders = createAsyncThunk(
  "provider/getAll",
  async ({ page = 1, limit = 12, search, category } = {}, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (category) params.category = category;
      const res = await axios.get(`${API_URL}/api/provider-profile`, { params });
      return {
        providers: res.data.providers || [],
        pagination: res.data.pagination || null,
        categories: res.data.categories || [],
      };
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

export const updateMyProviderBio = createAsyncThunk(
  "provider/updateMyBio",
  async (bio, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_URL}/api/provider-profile/`, { bio });
      return res.data.profile;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update provider bio");
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
  categories: [],
  pagination: null,
  listRequestId: null,
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
      .addCase(getAllProviders.pending, (state, action) => {
        state.isFetchingAll = true;
        state.error = null;
        state.listRequestId = action.meta.requestId;
      })
      .addCase(getAllProviders.fulfilled, (state, action) => {
        if (state.listRequestId !== action.meta.requestId) return;
        state.isFetchingAll = false;
        state.allProviders = action.payload?.providers || [];
        state.pagination = action.payload?.pagination || null;
        state.categories = action.payload?.categories || [];
        state.error = null;
      })
      .addCase(getAllProviders.rejected, (state, action) => {
        if (state.listRequestId !== action.meta.requestId) return;
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
      .addCase(updateMyProviderBio.fulfilled, (state, action) => {
        if (action.payload) {
          state.myProviderProfile = {
            ...(state.myProviderProfile || {}),
            ...action.payload,
          };
        }
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
          if (shouldToastApiMessage(action.payload)) {
            toast.error(action.payload);
          }
        }
      });
  },
});

export const { clearSelectedProvider } = providerSlice.actions;
export default providerSlice.reducer;
