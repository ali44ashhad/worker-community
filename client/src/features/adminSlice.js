import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
axios.defaults.withCredentials = true;

/* ----------------- THUNKS ----------------- */

// Get admin dashboard stats
export const getAdminDashboardStats = createAsyncThunk(
  "admin/getDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/dashboard-stats`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch dashboard stats");
    }
  }
);

// Get all providers (admin)
export const getAllProvidersAdmin = createAsyncThunk(
  "admin/getAllProviders",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/all-providers`);
      return res.data.providers;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch providers");
    }
  }
);

// Update provider details (admin)
export const updateProviderDetails = createAsyncThunk(
  "admin/updateProviderDetails",
  async ({ providerId, bio }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_URL}/api/admin/update-provider/${providerId}`, { bio });
      toast.success("Provider details updated successfully");
      return res.data.provider;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update provider");
      return rejectWithValue(err.response?.data?.message || "Failed to update provider");
    }
  }
);

// Update provider user details (admin)
export const updateProviderUserDetails = createAsyncThunk(
  "admin/updateProviderUserDetails",
  async ({ providerId, name, email, phoneNumber, address }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_URL}/api/admin/update-provider-user/${providerId}`, {
        name,
        email,
        phoneNumber,
        address
      });
      toast.success("Provider user details updated successfully");
      return res.data.provider;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update provider");
      return rejectWithValue(err.response?.data?.message || "Failed to update provider");
    }
  }
);

// Get all services (admin)
export const getAllServicesAdmin = createAsyncThunk(
  "admin/getAllServices",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/all-services`);
      return res.data.services;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch services");
    }
  }
);

// Update service details (admin)
export const updateServiceDetails = createAsyncThunk(
  "admin/updateServiceDetails",
  async ({ serviceId, formData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_URL}/api/admin/update-service/${serviceId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success("Service updated successfully");
      return res.data.service;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update service");
      return rejectWithValue(err.response?.data?.message || "Failed to update service");
    }
  }
);

// Delete service image (admin)
export const deleteServiceImage = createAsyncThunk(
  "admin/deleteServiceImage",
  async ({ serviceId, imagePublicId }, { rejectWithValue }) => {
    try {
      // Use query parameter to handle public_id with forward slashes
      const encodedPublicId = encodeURIComponent(imagePublicId);
      const res = await axios.delete(`${API_URL}/api/admin/service/${serviceId}/image?publicId=${encodedPublicId}`);
      toast.success("Image deleted successfully");
      return { serviceId, service: res.data.service };
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete image");
      return rejectWithValue(err.response?.data?.message || "Failed to delete image");
    }
  }
);

/* ----------------- SLICE ----------------- */

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    dashboardStats: null,
    providers: [],
    services: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearAdminState: (state) => {
      state.dashboardStats = null;
      state.providers = [];
      state.services = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get dashboard stats
      .addCase(getAdminDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAdminDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(getAdminDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get all providers
      .addCase(getAllProvidersAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllProvidersAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.providers = action.payload;
      })
      .addCase(getAllProvidersAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update provider details
      .addCase(updateProviderDetails.fulfilled, (state, action) => {
        const updatedProvider = action.payload;
        const index = state.providers.findIndex((p) => p._id === updatedProvider._id);
        if (index !== -1) {
          state.providers[index] = updatedProvider;
        }
      })
      // Update provider user details
      .addCase(updateProviderUserDetails.fulfilled, (state, action) => {
        const updatedProvider = action.payload;
        const index = state.providers.findIndex((p) => p._id === updatedProvider._id);
        if (index !== -1) {
          state.providers[index] = updatedProvider;
        }
      })
      // Get all services
      .addCase(getAllServicesAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllServicesAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = action.payload;
      })
      .addCase(getAllServicesAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update service details
      .addCase(updateServiceDetails.fulfilled, (state, action) => {
        const updatedService = action.payload;
        const index = state.services.findIndex((s) => s._id === updatedService._id);
        if (index !== -1) {
          state.services[index] = updatedService;
        }
      })
      // Delete service image
      .addCase(deleteServiceImage.fulfilled, (state, action) => {
        const { serviceId, service } = action.payload;
        const index = state.services.findIndex((s) => s._id === serviceId);
        if (index !== -1) {
          state.services[index] = service;
        }
      });
  },
});

export const { clearAdminState } = adminSlice.actions;
export default adminSlice.reducer;

