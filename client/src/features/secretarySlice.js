import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";
import { getApiBase } from "../utils/apiBase";
import { appendEventAttachmentsToFormData } from "../utils/eventAttachmentForm";

const API_URL = getApiBase() || "http://localhost:3001";
axios.defaults.withCredentials = true;

export const fetchPendingRegistrations = createAsyncThunk(
  "secretary/fetchPending",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/secretary/registrations/pending`);
      return res.data?.data?.users || [];
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
      toast.error(message);
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
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchCommunityMembers = createAsyncThunk(
  "secretary/fetchMembers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/secretary/members`);
      const data = res.data?.data || {};
      return {
        users: data.users || [],
        needsCommunName: Boolean(data.needsCommunName),
        communityCommunName: data.communityCommunName || null,
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
      toast.error(message);
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
      toast.error(message);
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
  async ({ title, description, expiresAt, files = [], links = [] }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("expiresAt", expiresAt);
      appendEventAttachmentsToFormData(formData, { files, links });

      const res = await axios.post(`${API_URL}/api/secretary/events`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data?.message || "Event created.");
      return res.data?.data?.event;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create event";
      toast.error(message);
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
      toast.error(message);
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
      toast.error(message);
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
      toast.error(message);
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
    members: [],
    membersLoading: false,
    membersError: null,
    membersMeta: {
      needsCommunName: false,
      communityCommunName: null,
    },
    featureToggles: {},
    featureTogglesLoading: false,
    featureTogglesError: null,
    featureTogglesSaving: false,
    featureTogglesMeta: {
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
        state.pendingUsers = action.payload;
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
      });
  },
});

export default secretarySlice.reducer;
