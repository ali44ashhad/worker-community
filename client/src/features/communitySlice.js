import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getApiBase } from '../utils/apiBase';
import { appendEventAttachmentsToFormData } from '../utils/eventAttachmentForm';

const API_URL = getApiBase() || 'http://localhost:3001';
axios.defaults.withCredentials = true;

const defaultFeatures = {
  broadcast: false,
  events: false,
  communityCommunName: null,
  hasCommunity: false,
};

export const fetchCommunityFeatures = createAsyncThunk(
  'community/fetchFeatures',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/user/community-features`);
      return res.data?.data || defaultFeatures;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load community features');
    }
  }
);

export const fetchCommunityEvents = createAsyncThunk(
  'community/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/user/community-events`);
      return res.data?.data || { events: [], hasCommunity: false, eventsEnabled: false };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load events');
    }
  }
);

export const createCommunityEvent = createAsyncThunk(
  'community/createEvent',
  async ({ title, description, expiresAt, files = [], links = [] }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('expiresAt', expiresAt);
      appendEventAttachmentsToFormData(formData, { files, links });

      const res = await axios.post(`${API_URL}/api/user/community-events`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { event: res.data?.data?.event, message: res.data?.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create event');
    }
  }
);

export const deleteCommunityEvent = createAsyncThunk(
  'community/deleteEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`${API_URL}/api/user/community-events/${eventId}`);
      return { eventId, message: res.data?.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete event');
    }
  }
);

export const fetchCommunityBroadcasts = createAsyncThunk(
  'community/fetchBroadcasts',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/user/community-broadcasts`);
      return res.data?.data || { broadcasts: [], hasCommunity: false, broadcastEnabled: false };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load broadcasts');
    }
  }
);

export const fetchCommunityVendors = createAsyncThunk(
  'community/fetchVendors',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/vendors/community`);
      return res.data?.data || { categories: [], vendorsByCategory: {}, needsCommunity: false, communityCommunName: null };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load vendors');
    }
  }
);

export const fetchCommunityEmergencyContacts = createAsyncThunk(
  'community/fetchEmergencyContacts',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/emergency-contacts/community`);
      return res.data?.data || { contacts: [], needsCommunity: false, communityCommunName: null };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load emergency contacts');
    }
  }
);

export const fetchCommunityDirectory = createAsyncThunk(
  'community/fetchDirectory',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/user/community-directory`);
      return res.data?.data || { members: [], needsCommunity: false, communityCommunName: null };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load directory');
    }
  }
);

const communitySlice = createSlice({
  name: 'community',
  initialState: {
    features: defaultFeatures,
    loading: false,
    error: null,
    broadcasts: [],
    broadcastsLoading: false,
    broadcastsError: null,
    broadcastsMeta: {
      hasCommunity: false,
      broadcastEnabled: false,
      communityCommunName: null,
    },
    events: [],
    eventsLoading: false,
    eventsError: null,
    eventsMeta: {
      hasCommunity: false,
      eventsEnabled: false,
      communityCommunName: null,
    },
    eventSending: false,
    eventDeletingId: null,
    vendors: {
      categories: [],
      vendorsByCategory: {},
    },
    vendorsLoading: false,
    vendorsError: null,
    vendorsMeta: {
      needsCommunity: false,
      communityCommunName: null,
    },
    emergencyContacts: [],
    emergencyContactsLoading: false,
    emergencyContactsError: null,
    emergencyContactsMeta: {
      needsCommunity: false,
      communityCommunName: null,
    },
    directoryMembers: [],
    directoryLoading: false,
    directoryError: null,
    directoryMeta: {
      needsCommunity: false,
      communityCommunName: null,
    },
  },
  reducers: {
    clearCommunityFeatures: (state) => {
      state.features = defaultFeatures;
      state.error = null;
      state.broadcasts = [];
      state.broadcastsError = null;
      state.broadcastsMeta = {
        hasCommunity: false,
        broadcastEnabled: false,
        communityCommunName: null,
      };
      state.events = [];
      state.eventsError = null;
      state.eventsMeta = {
        hasCommunity: false,
        eventsEnabled: false,
        communityCommunName: null,
      };
      state.vendors = { categories: [], vendorsByCategory: {} };
      state.vendorsError = null;
      state.vendorsMeta = { needsCommunity: false, communityCommunName: null };
      state.emergencyContacts = [];
      state.emergencyContactsError = null;
      state.emergencyContactsMeta = { needsCommunity: false, communityCommunName: null };
      state.directoryMembers = [];
      state.directoryError = null;
      state.directoryMeta = { needsCommunity: false, communityCommunName: null };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommunityFeatures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommunityFeatures.fulfilled, (state, action) => {
        state.loading = false;
        state.features = action.payload;
      })
      .addCase(fetchCommunityFeatures.rejected, (state, action) => {
        state.loading = false;
        state.features = defaultFeatures;
        state.error = action.payload;
      })
      .addCase(fetchCommunityBroadcasts.pending, (state) => {
        state.broadcastsLoading = true;
        state.broadcastsError = null;
      })
      .addCase(fetchCommunityBroadcasts.fulfilled, (state, action) => {
        state.broadcastsLoading = false;
        state.broadcasts = action.payload.broadcasts || [];
        state.broadcastsMeta = {
          hasCommunity: Boolean(action.payload.hasCommunity),
          broadcastEnabled: Boolean(action.payload.broadcastEnabled),
          communityCommunName: action.payload.communityCommunName || null,
        };
      })
      .addCase(fetchCommunityBroadcasts.rejected, (state, action) => {
        state.broadcastsLoading = false;
        state.broadcastsError = action.payload;
      })
      .addCase(fetchCommunityEvents.pending, (state) => {
        state.eventsLoading = true;
        state.eventsError = null;
      })
      .addCase(fetchCommunityEvents.fulfilled, (state, action) => {
        state.eventsLoading = false;
        state.events = action.payload.events || [];
        state.eventsMeta = {
          hasCommunity: Boolean(action.payload.hasCommunity),
          eventsEnabled: Boolean(action.payload.eventsEnabled),
          communityCommunName: action.payload.communityCommunName || null,
        };
      })
      .addCase(fetchCommunityEvents.rejected, (state, action) => {
        state.eventsLoading = false;
        state.eventsError = action.payload;
      })
      .addCase(createCommunityEvent.pending, (state) => {
        state.eventSending = true;
      })
      .addCase(createCommunityEvent.fulfilled, (state, action) => {
        state.eventSending = false;
        if (action.payload?.event) {
          state.events = [action.payload.event, ...state.events];
        }
      })
      .addCase(createCommunityEvent.rejected, (state) => {
        state.eventSending = false;
      })
      .addCase(deleteCommunityEvent.pending, (state, action) => {
        state.eventDeletingId = action.meta.arg;
      })
      .addCase(deleteCommunityEvent.fulfilled, (state, action) => {
        state.eventDeletingId = null;
        state.events = state.events.filter((e) => e._id !== action.payload.eventId);
      })
      .addCase(deleteCommunityEvent.rejected, (state) => {
        state.eventDeletingId = null;
      })
      .addCase(fetchCommunityVendors.pending, (state) => {
        state.vendorsLoading = true;
        state.vendorsError = null;
      })
      .addCase(fetchCommunityVendors.fulfilled, (state, action) => {
        state.vendorsLoading = false;
        state.vendors = {
          categories: action.payload.categories || [],
          vendorsByCategory: action.payload.vendorsByCategory || {},
        };
        state.vendorsMeta = {
          needsCommunity: Boolean(action.payload.needsCommunity),
          communityCommunName: action.payload.communityCommunName || null,
        };
      })
      .addCase(fetchCommunityVendors.rejected, (state, action) => {
        state.vendorsLoading = false;
        state.vendorsError = action.payload;
      })
      .addCase(fetchCommunityEmergencyContacts.pending, (state) => {
        state.emergencyContactsLoading = true;
        state.emergencyContactsError = null;
      })
      .addCase(fetchCommunityEmergencyContacts.fulfilled, (state, action) => {
        state.emergencyContactsLoading = false;
        state.emergencyContacts = action.payload.contacts || [];
        state.emergencyContactsMeta = {
          needsCommunity: Boolean(action.payload.needsCommunity),
          communityCommunName: action.payload.communityCommunName || null,
        };
      })
      .addCase(fetchCommunityEmergencyContacts.rejected, (state, action) => {
        state.emergencyContactsLoading = false;
        state.emergencyContactsError = action.payload;
      })
      .addCase(fetchCommunityDirectory.pending, (state) => {
        state.directoryLoading = true;
        state.directoryError = null;
      })
      .addCase(fetchCommunityDirectory.fulfilled, (state, action) => {
        state.directoryLoading = false;
        state.directoryMembers = action.payload.members || [];
        state.directoryMeta = {
          needsCommunity: Boolean(action.payload.needsCommunity),
          communityCommunName: action.payload.communityCommunName || null,
        };
      })
      .addCase(fetchCommunityDirectory.rejected, (state, action) => {
        state.directoryLoading = false;
        state.directoryError = action.payload;
      });
  },
});

export const { clearCommunityFeatures } = communitySlice.actions;
export default communitySlice.reducer;
