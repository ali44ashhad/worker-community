import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getApiBase } from '../utils/apiBase';

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
      files.forEach((file) => formData.append('attachments', file));
      const validLinks = links
        .filter((item) => String(item?.url || '').trim())
        .map((item) => ({
          url: String(item.url).trim(),
          label: String(item.label || '').trim(),
        }));
      if (validLinks.length > 0) {
        formData.append('attachmentLinks', JSON.stringify(validLinks));
      }

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
      });
  },
});

export const { clearCommunityFeatures } = communitySlice.actions;
export default communitySlice.reducer;
