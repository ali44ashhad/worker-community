import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";
import { getApiBase } from "../utils/apiBase";
import { shouldToastApiMessage } from "../utils/apiToast";

const API_URL = getApiBase() || "http://localhost:3001";
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

// Get all providers (admin) with pagination
export const getAllProvidersAdmin = createAsyncThunk(
  "admin/getAllProviders",
  async ({ page = 1, limit = 10, search = '' } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search.trim()) {
        params.append('search', search.trim());
      }
      const res = await axios.get(`${API_URL}/api/admin/all-providers?${params.toString()}`);
      return {
        providers: res.data.providers,
        pagination: res.data.pagination
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch providers");
    }
  }
);

// Get all users (admin) with pagination
export const getAllUsersAdmin = createAsyncThunk(
  "admin/getAllUsers",
  async ({ page = 1, limit = 10, search = '' } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search.trim()) {
        params.append('search', search.trim());
      }
      const res = await axios.get(`${API_URL}/api/admin/all-users?${params.toString()}`);
      return {
        users: res.data.users,
        usersPagination: res.data.pagination
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch users");
    }
  }
);

// Activate/deactivate user (admin)
export const updateUserStatusAdmin = createAsyncThunk(
  "admin/updateUserStatus",
  async ({ userId, isActive }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${API_URL}/api/admin/user-status/${userId}`, { isActive });
      toast.success(res.data?.message || "User status updated.");
      return res.data.user;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update user status";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Get one user profile (admin)
export const getUserByIdAdmin = createAsyncThunk(
  "admin/getUserById",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/users/${userId}`);
      return res.data.user;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load user profile";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Change user community (admin)
export const updateUserCommunityAdmin = createAsyncThunk(
  "admin/updateUserCommunity",
  async ({ userId, mode, communityCommunName, requestedCommunityName, accountStatus }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${API_URL}/api/admin/users/${userId}/community`, {
        mode,
        communityCommunName,
        requestedCommunityName,
        accountStatus,
      });
      toast.success(res.data?.message || "User community updated.");
      return res.data.user;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update user community";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Update provider details (admin)
export const updateProviderDetails = createAsyncThunk(
  "admin/updateProviderDetails",
  async ({ providerId, bio }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_URL}/api/admin/update-provider/${providerId}`, { bio });
      return res.data.provider;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update provider";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(err.response?.data?.message || "Failed to update provider");
    }
  }
);

// Update provider user details (admin)
export const updateProviderUserDetails = createAsyncThunk(
  "admin/updateProviderUserDetails",
  async ({ providerId, firstName, lastName, email, phoneNumber, addressLine1, addressLine2, city, state, zip }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_URL}/api/admin/update-provider-user/${providerId}`, {
        firstName,
        lastName,
        email,
        phoneNumber,
        addressLine1,
        addressLine2,
        city,
        state,
        zip
      });
      toast.success("Provider updated successfully");
      return res.data.provider;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update provider";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(err.response?.data?.message || "Failed to update provider");
    }
  }
);

// Get all services (admin) with pagination
export const getAllServicesAdmin = createAsyncThunk(
  "admin/getAllServices",
  async ({ page = 1, limit = 10, search = '' } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search.trim()) {
        params.append('search', search.trim());
      }
      const res = await axios.get(`${API_URL}/api/admin/all-services?${params.toString()}`);
      return {
        services: res.data.services,
        pagination: res.data.pagination
      };
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
      const message = err.response?.data?.message || "Failed to update service";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(err.response?.data?.message || "Failed to update service");
    }
  }
);

// Set service cover image (admin) — first image is shown on service cards
export const setServiceCoverImage = createAsyncThunk(
  "admin/setServiceCoverImage",
  async ({ serviceId, publicId }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${API_URL}/api/admin/service/${serviceId}/cover-image`, {
        publicId,
      });
      toast.success(res.data?.message || "Cover image updated");
      return { serviceId, service: res.data.service };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update cover image";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(err.response?.data?.message || "Failed to update cover image");
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
      const message = err.response?.data?.message || "Failed to delete image";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(err.response?.data?.message || "Failed to delete image");
    }
  }
);

// Delete service PDF (admin)
export const deleteServicePDF = createAsyncThunk(
  "admin/deleteServicePDF",
  async ({ serviceId, pdfPublicId }, { rejectWithValue }) => {
    try {
      // Use query parameter to handle public_id with forward slashes
      const encodedPublicId = encodeURIComponent(pdfPublicId);
      const res = await axios.delete(`${API_URL}/api/admin/service/${serviceId}/pdf?publicId=${encodedPublicId}`);
      toast.success("PDF deleted successfully");
      return { serviceId, service: res.data.service };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete PDF";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(err.response?.data?.message || "Failed to delete PDF");
    }
  }
);

// Get category clicks (admin)
export const getCategoryClicks = createAsyncThunk(
  "admin/getCategoryClicks",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      const res = await axios.get(`${API_URL}/api/admin/category-clicks?${params.toString()}`);
      return {
        categoryClicks: res.data.data,
        categoryClicksPagination: res.data.pagination,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch category clicks");
    }
  }
);

// Get provider clicks (admin)
export const getProviderClicks = createAsyncThunk(
  "admin/getProviderClicks",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      const res = await axios.get(`${API_URL}/api/admin/provider-clicks?${params.toString()}`);
      return {
        providerClicks: res.data.data,
        providerClicksPagination: res.data.pagination,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch provider clicks");
    }
  }
);

// ========================== CATEGORIES (Public) ==========================
export const getActiveCategories = createAsyncThunk(
  "admin/getActiveCategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/categories`);
      return res.data.categories;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch categories");
    }
  }
);

// ========================== CATEGORIES (Admin) ==========================
export const getAllCategoriesAdmin = createAsyncThunk(
  "admin/getAllCategories",
  async ({ page = 1, limit = 50, search = "" } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search.trim()) params.append("search", search.trim());
      const res = await axios.get(`${API_URL}/api/admin/categories?${params.toString()}`);
      return { categories: res.data.categories, pagination: res.data.pagination };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch categories");
    }
  }
);

export const createCategoryAdmin = createAsyncThunk(
  "admin/createCategory",
  async ({ name, subCategories = [], keywords = [], icon, isActive = true }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/api/admin/categories`, {
        name,
        subCategories,
        keywords,
        icon,
        isActive: Boolean(isActive),
      });
      toast.success(res.data?.message || "Category created.");
      return res.data.category;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create category";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateCategoryAdmin = createAsyncThunk(
  "admin/updateCategory",
  async ({ categoryId, patch }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_URL}/api/admin/categories/${categoryId}`, patch);
      toast.success(res.data?.message || "Category updated.");
      return res.data.category;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update category";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateCategoryStatusAdmin = createAsyncThunk(
  "admin/updateCategoryStatus",
  async ({ categoryId, isActive }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${API_URL}/api/admin/categories/${categoryId}/status`, { isActive });
      toast.success(res.data?.message || "Category status updated.");
      return res.data.category;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update category status";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getSecretariesAdmin = createAsyncThunk(
  "admin/getSecretaries",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/secretaries`);
      return res.data?.data?.secretaries || [];
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load secretaries";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const createSecretaryAdmin = createAsyncThunk(
  "admin/createSecretary",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/api/admin/secretaries`, payload);
      toast.success(res.data?.message || "Secretary created.");
      return res.data.user;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create secretary";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateSecretaryDetailsAdmin = createAsyncThunk(
  "admin/updateSecretaryDetails",
  async ({ userId, email, firstName, lastName }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${API_URL}/api/admin/secretaries/${userId}`, {
        email,
        firstName,
        lastName,
      });
      toast.success(res.data?.message || "Secretary updated.");
      return res.data?.data?.user;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update secretary";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(message);
    }
  }
);

/* ----------------- SLICE ----------------- */

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    dashboardStats: null,
    providers: [],
    users: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalProviders: 0,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 10
    },
    services: [],
    usersPagination: {
      currentPage: 1,
      totalPages: 1,
      totalUsers: 0,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 10
    },
    servicesPagination: {
      currentPage: 1,
      totalPages: 1,
      totalServices: 0,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 10
    },
    activeCategories: [],
    categoriesAdmin: [],
    categoriesAdminPagination: {
      currentPage: 1,
      totalPages: 1,
      totalCategories: 0,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 50,
    },
    categoryClicks: [],
    categoryClicksPagination: {
      currentPage: 1,
      totalPages: 1,
      totalCategories: 0,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 10,
    },
    providerClicks: [],
    providerClicksPagination: {
      currentPage: 1,
      totalPages: 1,
      totalProviders: 0,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 10,
    },
    secretaries: [],
    secretariesLoading: false,
    isLoading: false,
    error: null,
  },
  reducers: {},
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
        state.providers = action.payload.providers;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAllProvidersAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get all users
      .addCase(getAllUsersAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllUsersAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.usersPagination = action.payload.usersPagination;
      })
      .addCase(getAllUsersAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update user status
      .addCase(updateUserStatusAdmin.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        const index = state.users.findIndex((u) => u._id === updatedUser._id);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], ...updatedUser };
        }
      })
      // Update user community
      .addCase(updateUserCommunityAdmin.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        const index = state.users.findIndex((u) => u._id === updatedUser._id);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], ...updatedUser };
        }
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
        state.services = action.payload.services;
        state.servicesPagination = action.payload.pagination;
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
      })
      // Set service cover image
      .addCase(setServiceCoverImage.fulfilled, (state, action) => {
        const { serviceId, service } = action.payload;
        const index = state.services.findIndex((s) => s._id === serviceId);
        if (index !== -1) {
          state.services[index] = service;
        }
        state.providers = (state.providers || []).map((provider) => {
          if (!provider.serviceOfferings?.length) return provider;
          const offeringIndex = provider.serviceOfferings.findIndex((o) => o._id === serviceId);
          if (offeringIndex === -1) return provider;
          const nextOfferings = [...provider.serviceOfferings];
          nextOfferings[offeringIndex] = service;
          return { ...provider, serviceOfferings: nextOfferings };
        });
      })
      // Delete service PDF
      .addCase(deleteServicePDF.fulfilled, (state, action) => {
        const { serviceId, service } = action.payload;
        const index = state.services.findIndex((s) => s._id === serviceId);
        if (index !== -1) {
          state.services[index] = service;
        }
      })
      // Get category clicks
      .addCase(getCategoryClicks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCategoryClicks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categoryClicks = action.payload.categoryClicks;
        state.categoryClicksPagination = action.payload.categoryClicksPagination;
      })
      .addCase(getCategoryClicks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get provider clicks
      .addCase(getProviderClicks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProviderClicks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.providerClicks = action.payload.providerClicks;
        state.providerClicksPagination = action.payload.providerClicksPagination;
      })
      .addCase(getProviderClicks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get active categories (public)
      .addCase(getActiveCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getActiveCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeCategories = action.payload || [];
      })
      .addCase(getActiveCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Admin categories list
      .addCase(getAllCategoriesAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllCategoriesAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categoriesAdmin = action.payload.categories || [];
        state.categoriesAdminPagination = action.payload.pagination || state.categoriesAdminPagination;
      })
      .addCase(getAllCategoriesAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create category
      .addCase(createCategoryAdmin.fulfilled, (state, action) => {
        // Prepend so user sees it immediately
        state.categoriesAdmin = [action.payload, ...state.categoriesAdmin];
      })

      // Update category
      .addCase(updateCategoryAdmin.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.categoriesAdmin.findIndex((c) => c._id === updated._id);
        if (idx !== -1) state.categoriesAdmin[idx] = updated;
      })

      // Update category status
      .addCase(updateCategoryStatusAdmin.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.categoriesAdmin.findIndex((c) => c._id === updated._id);
        if (idx !== -1) state.categoriesAdmin[idx] = updated;
      })

      .addCase(getSecretariesAdmin.pending, (state) => {
        state.secretariesLoading = true;
        state.error = null;
      })
      .addCase(getSecretariesAdmin.fulfilled, (state, action) => {
        state.secretariesLoading = false;
        state.secretaries = action.payload;
      })
      .addCase(getSecretariesAdmin.rejected, (state, action) => {
        state.secretariesLoading = false;
        state.error = action.payload;
      })
      .addCase(createSecretaryAdmin.pending, (state) => {
        state.secretariesLoading = true;
        state.error = null;
      })
      .addCase(createSecretaryAdmin.fulfilled, (state, action) => {
        state.secretariesLoading = false;
        if (action.payload) {
          state.secretaries = [action.payload, ...state.secretaries];
        }
      })
      .addCase(createSecretaryAdmin.rejected, (state, action) => {
        state.secretariesLoading = false;
        state.error = action.payload;
      })
      .addCase(updateSecretaryDetailsAdmin.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated?._id) return;
        state.secretaries = (state.secretaries || []).map((u) => (u._id === updated._id ? updated : u));
      });
  },
});

export default adminSlice.reducer;

