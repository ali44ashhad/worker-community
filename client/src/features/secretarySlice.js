import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";
import { getApiBase } from "../utils/apiBase";
import { shouldToastApiMessage } from "../utils/apiToast";
import { appendEventAttachmentsToFormData } from "../utils/eventAttachmentForm";

const API_URL = getApiBase() || "http://localhost:3001";
axios.defaults.withCredentials = true;

export const fetchPendingRegistrations = createAsyncThunk(
  "secretary/fetchPending",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/secretary/registrations/pending`);
      return {
        users: res.data?.data?.users || [],
        needsCommunName: Boolean(res.data?.data?.needsCommunName),
        communityCommunName: res.data?.data?.communityCommunName || null,
      };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load pending registrations";
      return rejectWithValue(message);
    }
  }
);

export const approveUserRegistration = createAsyncThunk(
  "secretary/approve",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${API_URL}/api/secretary/registrations/${userId}/approve`);
      toast.success(res.data?.message || "Approved.");
      return userId;
    } catch (err) {
      const message = err.response?.data?.message || "Approve failed";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const rejectUserRegistration = createAsyncThunk(
  "secretary/reject",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${API_URL}/api/secretary/registrations/${userId}/reject`);
      toast.success(res.data?.message || "Rejected.");
      return userId;
    } catch (err) {
      const message = err.response?.data?.message || "Reject failed";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchCommunityMembers = createAsyncThunk(
  "secretary/fetchMembers",
  async ({ page = 1, limit = 10, search = "" } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));
      if (search.trim()) {
        params.append("search", search.trim());
      }
      const res = await axios.get(`${API_URL}/api/secretary/members?${params.toString()}`);
      const data = res.data?.data || {};
      return {
        users: data.users || [],
        needsCommunName: Boolean(data.needsCommunName),
        communityCommunName: data.communityCommunName || null,
        pagination: data.pagination || null,
      };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load members";
      return rejectWithValue(message);
    }
  }
);

export const updateCommunityMemberStatus = createAsyncThunk(
  "secretary/updateMemberStatus",
  async ({ userId, accountStatus }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${API_URL}/api/secretary/members/${userId}/status`, { accountStatus });
      toast.success(res.data?.message || "Member updated.");
      return res.data?.data?.user;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update member";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchFeatureToggles = createAsyncThunk(
  "secretary/fetchFeatureToggles",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/secretary/features/toggles`);
      const data = res.data?.data || {};
      return {
        toggles: data.toggles || {},
        communityCommunName: data.communityCommunName || null,
      };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load feature settings";
      return rejectWithValue(message);
    }
  }
);

export const updateFeatureToggle = createAsyncThunk(
  "secretary/updateFeatureToggle",
  async ({ key, enabled }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${API_URL}/api/secretary/features/toggles`, { key, enabled });
      return res.data?.data?.toggles || {};
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update feature";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchEventToggles = createAsyncThunk(
  "secretary/fetchEventToggles",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/secretary/events/toggles`);
      const data = res.data?.data || {};
      return {
        toggles: data.toggles || {},
        communityCommunName: data.communityCommunName || null,
      };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load event type settings";
      return rejectWithValue(message);
    }
  }
);

export const updateEventToggle = createAsyncThunk(
  "secretary/updateEventToggle",
  async ({ key, enabled }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${API_URL}/api/secretary/events/toggles`, { key, enabled });
      return res.data?.data?.toggles || {};
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update event type";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchCategoryToggles = createAsyncThunk(
  "secretary/fetchCategoryToggles",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/secretary/services/toggles`);
      const data = res.data?.data || {};
      return {
        categories: data.categories || [],
        toggles: data.toggles || {},
        communityCommunName: data.communityCommunName || null,
        needsCommunName: Boolean(data.needsCommunName),
      };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load service categories";
      return rejectWithValue(message);
    }
  }
);

export const updateCategoryToggle = createAsyncThunk(
  "secretary/updateCategoryToggle",
  async ({ categoryName, enabled }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${API_URL}/api/secretary/services/toggles`, {
        categoryName,
        enabled,
      });
      const data = res.data?.data || {};
      return {
        categories: data.categories || [],
        toggles: data.toggles || {},
      };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update service category";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchCommunityEvents = createAsyncThunk(
  "secretary/fetchCommunityEvents",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/secretary/events`);
      const data = res.data?.data || {};
      return {
        events: data.events || [],
        needsCommunName: Boolean(data.needsCommunName),
        communityCommunName: data.communityCommunName || null,
      };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load events";
      return rejectWithValue(message);
    }
  }
);

export const createCommunityEvent = createAsyncThunk(
  "secretary/createCommunityEvent",
  async ({ title, description, expiresAt, eventType, files = [], links = [] }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("expiresAt", expiresAt);
      if (eventType) formData.append("eventType", eventType);
      appendEventAttachmentsToFormData(formData, { files, links });

      const res = await axios.post(`${API_URL}/api/secretary/events`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data?.message || "Event created.");
      return res.data?.data?.event;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create event";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteCommunityEvent = createAsyncThunk(
  "secretary/deleteCommunityEvent",
  async (eventId, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`${API_URL}/api/secretary/events/${eventId}`);
      toast.success(res.data?.message || "Event deleted.");
      return eventId;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete event";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchBroadcasts = createAsyncThunk(
  "secretary/fetchBroadcasts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/secretary/broadcasts`);
      const data = res.data?.data || {};
      return {
        broadcasts: data.broadcasts || [],
        needsCommunName: Boolean(data.needsCommunName),
        communityCommunName: data.communityCommunName || null,
      };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load broadcasts";
      return rejectWithValue(message);
    }
  }
);

export const createBroadcast = createAsyncThunk(
  "secretary/createBroadcast",
  async ({ title, message }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/api/secretary/broadcasts`, { title, message });
      toast.success(res.data?.message || "Broadcast sent.");
      return res.data?.data?.broadcast;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to send broadcast";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteBroadcast = createAsyncThunk(
  "secretary/deleteBroadcast",
  async (broadcastId, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`${API_URL}/api/secretary/broadcasts/${broadcastId}`);
      toast.success(res.data?.message || "Broadcast deleted.");
      return broadcastId;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete broadcast";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchCommunityMemberById = createAsyncThunk(
  "secretary/fetchMemberById",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/secretary/members/${userId}`);
      return res.data?.data?.user;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load member profile";
      return rejectWithValue(message);
    }
  }
);

export const fetchVendorCategories = createAsyncThunk(
  "secretary/fetchVendorCategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/secretary/vendors/categories`);
      const data = res.data?.data || {};
      return {
        categories: data.categories || [],
        needsCommunName: Boolean(data.needsCommunName),
        communityCommunName: data.communityCommunName || null,
      };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load vendor categories";
      return rejectWithValue(message);
    }
  }
);

export const fetchSecretaryVendors = createAsyncThunk(
  "secretary/fetchSecretaryVendors",
  async ({ category } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      const qs = params.toString();
      const res = await axios.get(`${API_URL}/api/secretary/vendors${qs ? `?${qs}` : ""}`);
      const data = res.data?.data || {};
      return {
        vendors: data.vendors || [],
        needsCommunName: Boolean(data.needsCommunName),
        communityCommunName: data.communityCommunName || null,
      };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load vendors";
      return rejectWithValue(message);
    }
  }
);

export const createSecretaryVendor = createAsyncThunk(
  "secretary/createSecretaryVendor",
  async ({ category, name, phone, email, service }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/api/secretary/vendors`, { category, name, phone, email, service });
      toast.success(res.data?.message || "Vendor created.");
      return res.data?.data?.vendor;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create vendor";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteSecretaryVendor = createAsyncThunk(
  "secretary/deleteSecretaryVendor",
  async (vendorId, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`${API_URL}/api/secretary/vendors/${vendorId}`);
      toast.success(res.data?.message || "Vendor deleted.");
      return vendorId;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete vendor";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchEmergencyContacts = createAsyncThunk(
  "secretary/fetchEmergencyContacts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/secretary/emergency-contacts`);
      const data = res.data?.data || {};
      return {
        contacts: data.contacts || [],
        needsCommunName: Boolean(data.needsCommunName),
        communityCommunName: data.communityCommunName || null,
      };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load emergency contacts";
      return rejectWithValue(message);
    }
  }
);

export const createEmergencyContact = createAsyncThunk(
  "secretary/createEmergencyContact",
  async ({ title, name, phone, notes }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/api/secretary/emergency-contacts`, { title, name, phone, notes });
      toast.success(res.data?.message || "Emergency contact created.");
      return res.data?.data?.contact;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create emergency contact";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteEmergencyContact = createAsyncThunk(
  "secretary/deleteEmergencyContact",
  async (contactId, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`${API_URL}/api/secretary/emergency-contacts/${contactId}`);
      toast.success(res.data?.message || "Emergency contact deleted.");
      return contactId;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete emergency contact";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchSecretaryReviews = createAsyncThunk(
  "secretary/fetchReviews",
  async ({ page = 1, limit = 10, search = "" } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));
      if (search.trim()) params.append("search", search.trim());
      const res = await axios.get(`${API_URL}/api/secretary/reviews?${params.toString()}`);
      return {
        reviews: res.data?.reviews || [],
        pagination: res.data?.pagination || null,
        needsCommunName: Boolean(res.data?.needsCommunName),
        communityCommunName: res.data?.communityCommunName || null,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load reviews");
    }
  }
);

export const updateSecretaryReview = createAsyncThunk(
  "secretary/updateReview",
  async ({ commentId, comment, rating }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_URL}/api/secretary/reviews/${commentId}`, { comment, rating });
      toast.success(res.data?.message || "Review updated.");
      return res.data?.review;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update review";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteSecretaryReview = createAsyncThunk(
  "secretary/deleteReview",
  async (commentId, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`${API_URL}/api/secretary/reviews/${commentId}`);
      toast.success(res.data?.message || "Review deleted.");
      return commentId;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete review";
      if (shouldToastApiMessage(message, err.response?.status, err.response?.data)) toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const secretarySlice = createSlice({
  name: "secretary",
  initialState: {
    pendingUsers: [],
    loading: false,
    error: null,
    pendingMeta: {
      needsCommunName: false,
      communityCommunName: null,
    },
    members: [],
    membersLoading: false,
    membersError: null,
    membersMeta: {
      needsCommunName: false,
      communityCommunName: null,
    },
    membersPagination: null,
    memberProfile: null,
    memberProfileLoading: false,
    memberProfileError: null,
    featureToggles: {},
    featureTogglesLoading: false,
    featureTogglesError: null,
    featureTogglesSaving: false,
    featureTogglesMeta: {
      communityCommunName: null,
    },
    eventToggles: {},
    eventTogglesLoading: false,
    eventTogglesError: null,
    eventTogglesSaving: false,
    eventTogglesMeta: {
      communityCommunName: null,
    },
    communityEvents: [],
    communityEventsLoading: false,
    communityEventsError: null,
    communityEventsMeta: {
      needsCommunName: false,
      communityCommunName: null,
    },
    communityEventSending: false,
    communityEventDeletingId: null,
    broadcasts: [],
    broadcastsLoading: false,
    broadcastsError: null,
    broadcastsMeta: {
      needsCommunName: false,
      communityCommunName: null,
    },
    broadcastSending: false,
    broadcastDeletingId: null,
    categoryToggles: [],
    categoryTogglesLoading: false,
    categoryTogglesError: null,
    categoryTogglesSaving: false,
    categoryTogglesMeta: {
      needsCommunName: false,
      communityCommunName: null,
    },
    vendorCategories: [],
    vendorCategoriesLoading: false,
    vendorCategoriesError: null,
    vendorCategoriesMeta: {
      needsCommunName: false,
      communityCommunName: null,
    },
    vendors: [],
    vendorsLoading: false,
    vendorsError: null,
    vendorCreating: false,
    vendorDeletingId: null,

    emergencyContacts: [],
    emergencyContactsLoading: false,
    emergencyContactsError: null,
    emergencyContactsMeta: {
      needsCommunName: false,
      communityCommunName: null,
    },
    emergencyContactCreating: false,
    emergencyContactDeletingId: null,

    reviews: [],
    reviewsLoading: false,
    reviewsError: null,
    reviewsPagination: null,
    reviewsMeta: {
      needsCommunName: false,
      communityCommunName: null,
    },
    reviewUpdating: false,
    reviewDeletingId: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingRegistrations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingRegistrations.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingUsers = action.payload.users || [];
        state.pendingMeta.needsCommunName = Boolean(action.payload.needsCommunName);
        state.pendingMeta.communityCommunName = action.payload.communityCommunName || null;
      })
      .addCase(fetchPendingRegistrations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(approveUserRegistration.fulfilled, (state, action) => {
        state.pendingUsers = state.pendingUsers.filter((u) => u._id !== action.payload);
      })
      .addCase(rejectUserRegistration.fulfilled, (state, action) => {
        state.pendingUsers = state.pendingUsers.filter((u) => u._id !== action.payload);
      })
      .addCase(fetchCommunityMembers.pending, (state) => {
        state.membersLoading = true;
        state.membersError = null;
      })
      .addCase(fetchCommunityMembers.fulfilled, (state, action) => {
        state.membersLoading = false;
        state.members = action.payload.users;
        state.membersMeta = {
          needsCommunName: action.payload.needsCommunName,
          communityCommunName: action.payload.communityCommunName,
        };
        state.membersPagination = action.payload.pagination;
      })
      .addCase(fetchCommunityMembers.rejected, (state, action) => {
        state.membersLoading = false;
        state.membersError = action.payload;
      })
      .addCase(updateCommunityMemberStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated?._id) return;
        state.members = state.members.map((u) => (u._id === updated._id ? { ...u, ...updated } : u));
      })
      .addCase(fetchCommunityMemberById.pending, (state) => {
        state.memberProfileLoading = true;
        state.memberProfileError = null;
        state.memberProfile = null;
      })
      .addCase(fetchCommunityMemberById.fulfilled, (state, action) => {
        state.memberProfileLoading = false;
        state.memberProfile = action.payload || null;
      })
      .addCase(fetchCommunityMemberById.rejected, (state, action) => {
        state.memberProfileLoading = false;
        state.memberProfileError = action.payload;
      })
      .addCase(fetchFeatureToggles.pending, (state) => {
        state.featureTogglesLoading = true;
        state.featureTogglesError = null;
      })
      .addCase(fetchFeatureToggles.fulfilled, (state, action) => {
        state.featureTogglesLoading = false;
        state.featureToggles = action.payload.toggles;
        state.featureTogglesMeta.communityCommunName = action.payload.communityCommunName;
      })
      .addCase(fetchFeatureToggles.rejected, (state, action) => {
        state.featureTogglesLoading = false;
        state.featureTogglesError = action.payload;
      })
      .addCase(updateFeatureToggle.pending, (state) => {
        state.featureTogglesSaving = true;
      })
      .addCase(updateFeatureToggle.fulfilled, (state, action) => {
        state.featureTogglesSaving = false;
        state.featureToggles = action.payload;
      })
      .addCase(updateFeatureToggle.rejected, (state) => {
        state.featureTogglesSaving = false;
      })
      .addCase(fetchEventToggles.pending, (state) => {
        state.eventTogglesLoading = true;
        state.eventTogglesError = null;
      })
      .addCase(fetchEventToggles.fulfilled, (state, action) => {
        state.eventTogglesLoading = false;
        state.eventToggles = action.payload.toggles;
        state.eventTogglesMeta.communityCommunName = action.payload.communityCommunName;
      })
      .addCase(fetchEventToggles.rejected, (state, action) => {
        state.eventTogglesLoading = false;
        state.eventTogglesError = action.payload;
      })
      .addCase(updateEventToggle.pending, (state) => {
        state.eventTogglesSaving = true;
      })
      .addCase(updateEventToggle.fulfilled, (state, action) => {
        state.eventTogglesSaving = false;
        state.eventToggles = action.payload;
      })
      .addCase(updateEventToggle.rejected, (state) => {
        state.eventTogglesSaving = false;
      })
      .addCase(fetchCommunityEvents.pending, (state) => {
        state.communityEventsLoading = true;
        state.communityEventsError = null;
      })
      .addCase(fetchCommunityEvents.fulfilled, (state, action) => {
        state.communityEventsLoading = false;
        state.communityEvents = action.payload.events;
        state.communityEventsMeta = {
          needsCommunName: action.payload.needsCommunName,
          communityCommunName: action.payload.communityCommunName,
        };
      })
      .addCase(fetchCommunityEvents.rejected, (state, action) => {
        state.communityEventsLoading = false;
        state.communityEventsError = action.payload;
      })
      .addCase(createCommunityEvent.pending, (state) => {
        state.communityEventSending = true;
      })
      .addCase(createCommunityEvent.fulfilled, (state, action) => {
        state.communityEventSending = false;
        if (action.payload) {
          state.communityEvents = [action.payload, ...state.communityEvents];
        }
      })
      .addCase(createCommunityEvent.rejected, (state) => {
        state.communityEventSending = false;
      })
      .addCase(deleteCommunityEvent.pending, (state, action) => {
        state.communityEventDeletingId = action.meta.arg;
      })
      .addCase(deleteCommunityEvent.fulfilled, (state, action) => {
        state.communityEventDeletingId = null;
        state.communityEvents = state.communityEvents.filter((e) => e._id !== action.payload);
      })
      .addCase(deleteCommunityEvent.rejected, (state) => {
        state.communityEventDeletingId = null;
      })
      .addCase(fetchBroadcasts.pending, (state) => {
        state.broadcastsLoading = true;
        state.broadcastsError = null;
      })
      .addCase(fetchBroadcasts.fulfilled, (state, action) => {
        state.broadcastsLoading = false;
        state.broadcasts = action.payload.broadcasts;
        state.broadcastsMeta = {
          needsCommunName: action.payload.needsCommunName,
          communityCommunName: action.payload.communityCommunName,
        };
      })
      .addCase(fetchBroadcasts.rejected, (state, action) => {
        state.broadcastsLoading = false;
        state.broadcastsError = action.payload;
      })
      .addCase(createBroadcast.pending, (state) => {
        state.broadcastSending = true;
      })
      .addCase(createBroadcast.fulfilled, (state, action) => {
        state.broadcastSending = false;
        if (action.payload) {
          state.broadcasts = [action.payload, ...state.broadcasts];
        }
      })
      .addCase(createBroadcast.rejected, (state) => {
        state.broadcastSending = false;
      })
      .addCase(deleteBroadcast.pending, (state, action) => {
        state.broadcastDeletingId = action.meta.arg;
      })
      .addCase(deleteBroadcast.fulfilled, (state, action) => {
        state.broadcastDeletingId = null;
        state.broadcasts = state.broadcasts.filter((b) => b._id !== action.payload);
      })
      .addCase(deleteBroadcast.rejected, (state) => {
        state.broadcastDeletingId = null;
      })
      .addCase(fetchCategoryToggles.pending, (state) => {
        state.categoryTogglesLoading = true;
        state.categoryTogglesError = null;
      })
      .addCase(fetchCategoryToggles.fulfilled, (state, action) => {
        state.categoryTogglesLoading = false;
        state.categoryToggles = action.payload.categories;
        state.categoryTogglesMeta = {
          needsCommunName: action.payload.needsCommunName,
          communityCommunName: action.payload.communityCommunName,
        };
      })
      .addCase(fetchCategoryToggles.rejected, (state, action) => {
        state.categoryTogglesLoading = false;
        state.categoryTogglesError = action.payload;
      })
      .addCase(updateCategoryToggle.pending, (state) => {
        state.categoryTogglesSaving = true;
      })
      .addCase(updateCategoryToggle.fulfilled, (state, action) => {
        state.categoryTogglesSaving = false;
        state.categoryToggles = action.payload.categories;
      })
      .addCase(updateCategoryToggle.rejected, (state) => {
        state.categoryTogglesSaving = false;
      })
      .addCase(fetchVendorCategories.pending, (state) => {
        state.vendorCategoriesLoading = true;
        state.vendorCategoriesError = null;
      })
      .addCase(fetchVendorCategories.fulfilled, (state, action) => {
        state.vendorCategoriesLoading = false;
        state.vendorCategories = action.payload.categories || [];
        state.vendorCategoriesMeta = {
          needsCommunName: action.payload.needsCommunName,
          communityCommunName: action.payload.communityCommunName,
        };
      })
      .addCase(fetchVendorCategories.rejected, (state, action) => {
        state.vendorCategoriesLoading = false;
        state.vendorCategoriesError = action.payload;
      })
      .addCase(fetchSecretaryVendors.pending, (state) => {
        state.vendorsLoading = true;
        state.vendorsError = null;
      })
      .addCase(fetchSecretaryVendors.fulfilled, (state, action) => {
        state.vendorsLoading = false;
        state.vendors = action.payload.vendors || [];
      })
      .addCase(fetchSecretaryVendors.rejected, (state, action) => {
        state.vendorsLoading = false;
        state.vendorsError = action.payload;
      })
      .addCase(createSecretaryVendor.pending, (state) => {
        state.vendorCreating = true;
      })
      .addCase(createSecretaryVendor.fulfilled, (state, action) => {
        state.vendorCreating = false;
        if (action.payload) state.vendors = [action.payload, ...state.vendors];
        const category = action.payload?.category;
        if (category && !state.vendorCategories.includes(category)) {
          state.vendorCategories = [...state.vendorCategories, category].sort((a, b) => String(a).localeCompare(String(b)));
        }
      })
      .addCase(createSecretaryVendor.rejected, (state) => {
        state.vendorCreating = false;
      })
      .addCase(deleteSecretaryVendor.pending, (state, action) => {
        state.vendorDeletingId = action.meta.arg;
      })
      .addCase(deleteSecretaryVendor.fulfilled, (state, action) => {
        state.vendorDeletingId = null;
        state.vendors = state.vendors.filter((v) => v._id !== action.payload);
      })
      .addCase(deleteSecretaryVendor.rejected, (state) => {
        state.vendorDeletingId = null;
      })
      .addCase(fetchEmergencyContacts.pending, (state) => {
        state.emergencyContactsLoading = true;
        state.emergencyContactsError = null;
      })
      .addCase(fetchEmergencyContacts.fulfilled, (state, action) => {
        state.emergencyContactsLoading = false;
        state.emergencyContacts = action.payload.contacts || [];
        state.emergencyContactsMeta = {
          needsCommunName: action.payload.needsCommunName,
          communityCommunName: action.payload.communityCommunName,
        };
      })
      .addCase(fetchEmergencyContacts.rejected, (state, action) => {
        state.emergencyContactsLoading = false;
        state.emergencyContactsError = action.payload;
      })
      .addCase(createEmergencyContact.pending, (state) => {
        state.emergencyContactCreating = true;
      })
      .addCase(createEmergencyContact.fulfilled, (state, action) => {
        state.emergencyContactCreating = false;
        if (action.payload) state.emergencyContacts = [action.payload, ...state.emergencyContacts];
      })
      .addCase(createEmergencyContact.rejected, (state) => {
        state.emergencyContactCreating = false;
      })
      .addCase(deleteEmergencyContact.pending, (state, action) => {
        state.emergencyContactDeletingId = action.meta.arg;
      })
      .addCase(deleteEmergencyContact.fulfilled, (state, action) => {
        state.emergencyContactDeletingId = null;
        state.emergencyContacts = state.emergencyContacts.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteEmergencyContact.rejected, (state) => {
        state.emergencyContactDeletingId = null;
      })
      .addCase(fetchSecretaryReviews.pending, (state) => {
        state.reviewsLoading = true;
        state.reviewsError = null;
      })
      .addCase(fetchSecretaryReviews.fulfilled, (state, action) => {
        state.reviewsLoading = false;
        state.reviews = action.payload.reviews || [];
        state.reviewsPagination = action.payload.pagination;
        state.reviewsMeta = {
          needsCommunName: action.payload.needsCommunName,
          communityCommunName: action.payload.communityCommunName,
        };
      })
      .addCase(fetchSecretaryReviews.rejected, (state, action) => {
        state.reviewsLoading = false;
        state.reviewsError = action.payload;
      })
      .addCase(updateSecretaryReview.pending, (state) => {
        state.reviewUpdating = true;
      })
      .addCase(updateSecretaryReview.fulfilled, (state, action) => {
        state.reviewUpdating = false;
        const updated = action.payload;
        if (!updated?._id) return;
        state.reviews = state.reviews.map((r) => (r._id === updated._id ? updated : r));
      })
      .addCase(updateSecretaryReview.rejected, (state) => {
        state.reviewUpdating = false;
      })
      .addCase(deleteSecretaryReview.pending, (state, action) => {
        state.reviewDeletingId = action.meta.arg;
      })
      .addCase(deleteSecretaryReview.fulfilled, (state, action) => {
        state.reviewDeletingId = null;
        state.reviews = state.reviews.filter((r) => r._id !== action.payload);
        if (state.reviewsPagination) {
          state.reviewsPagination = {
            ...state.reviewsPagination,
            totalReviews: Math.max(0, (state.reviewsPagination.totalReviews || 1) - 1),
          };
        }
      })
      .addCase(deleteSecretaryReview.rejected, (state) => {
        state.reviewDeletingId = null;
      });
  },
});

export default secretarySlice.reducer;
