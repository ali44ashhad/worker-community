import { createSlice, createAsyncThunk, isRejectedWithValue } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
axios.defaults.withCredentials = true;

/* ----------------- THUNKS ----------------- */

// Get all providers (for the public list)
export const getAllProviders = createAsyncThunk(
  "provider/getAll",
  async (_, { rejectWithValue }) => {
    try {
      // NOTE: Update this API endpoint to your actual route
      const res = await axios.get(`${API_URL}/api/provider-profile`); 
      return res.data.providers; // Assuming the API returns { success: true, providers: [...] }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch providers");
    }
  }
);

// Get single provider by ID (for the detail page)
export const getProviderById = createAsyncThunk(
  "provider/getById",
  async (providerProfileId, { rejectWithValue }) => {
    try {
      // NOTE: Update this API endpoint to your actual route
      const res = await axios.get(`${API_URL}/api/provider-profile/${providerProfileId}`);
      return res.data.provider; // Assuming { success: true, provider: {...} }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Provider not found");
    }
  }
);

// Become a provider (submitting the form)
export const becomeProvider = createAsyncThunk(
  "provider/become",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/api/provider-profile/become-provider`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      return res.data; // Return { success, user, profile }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Profile creation failed");
    }
  }
);

// Update an existing provider profile
export const updateProviderProfile = createAsyncThunk(
  "provider/update",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_URL}/api/provider-profile/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.profile; // Return { success, profile }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Profile update failed");
    }
  }
);

// Get current user's provider profile with services
export const getMyProviderProfile = createAsyncThunk(
  "provider/getMyProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/provider-profile/my-profile`);
      return res.data.provider; // Return { success, provider }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch profile");
    }
  }
);


/* ----------------- SLICE ----------------- */

const initialState = {
  allProviders: [],
  selectedProvider: null,
  myProviderProfile: null, // Current user's provider profile
  isFetchingAll: false,
  isFetchingSelected: false,
  isFetchingMyProfile: false,
  isUpdatingProfile: false,
  error: null,
};

const providerSlice = createSlice({
  name: "provider",
  initialState,
  reducers: {
    // Reducer to clear the selected provider when you leave the detail page
    clearSelectedProvider(state) {
      state.selectedProvider = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all providers
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

      // Get provider by ID
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

      // Become Provider
      .addCase(becomeProvider.pending, (state) => {
        state.isUpdatingProfile = true;
        state.error = null;
      })
      .addCase(becomeProvider.fulfilled, (state) => {
        state.isUpdatingProfile = false;
        // You might update allProviders or selectedProvider if needed
        toast.success("Profile created!");
      })
      .addCase(becomeProvider.rejected, (state, action) => {
        state.isUpdatingProfile = false;
        state.error = action.payload;
      })

      // Update Provider Profile
      .addCase(updateProviderProfile.pending, (state) => {
        state.isUpdatingProfile = true;
        state.error = null;
      })
      .addCase(updateProviderProfile.fulfilled, (state, action) => {
        state.isUpdatingProfile = false;
        state.selectedProvider = action.payload; // Update the selected profile
        toast.success("Profile updated!");
      })
      .addCase(updateProviderProfile.rejected, (state, action) => {
        state.isUpdatingProfile = false;
        state.error = action.payload;
      })

      // Get My Provider Profile
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
      
      // Show toasts only for provider-related rejected actions, but only if we don't have cached data
      .addMatcher(isRejectedWithValue(), (state, action) => {
        if (action.payload && typeof action.type === 'string' && action.type.startsWith('provider/')) {
          // Only show error toast if we don't have cached data (to avoid spam on refresh failures)
          if (action.type === 'provider/getAll/rejected' && state.allProviders.length > 0) {
            // Don't show error if we already have providers cached
            return;
          }
          toast.error(action.payload);
        }
      });
  },
});

export const { clearSelectedProvider } = providerSlice.actions;
export default providerSlice.reducer;