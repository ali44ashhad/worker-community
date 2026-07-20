import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { getApiBase } from '../utils/apiBase';
import { logoutUser } from './authSlice';

const API_URL = getApiBase() || 'http://localhost:3001';

export const fetchInboxCounts = createAsyncThunk(
  'inbox/fetchCounts',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/user/inbox/counts`, { withCredentials: true });
      return res.data?.data?.counts || {};
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load notifications');
    }
  }
);

export const markInboxRead = createAsyncThunk(
  'inbox/markRead',
  async (category, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/user/inbox/mark-read`,
        { category },
        { withCredentials: true }
      );
      return res.data?.data?.counts || {};
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update notifications');
    }
  }
);

const emptyCounts = {
  approvals: 0,
  communities: 0,
  broadcast: 0,
  events: 0,
  registration: 0,
};

const inboxSlice = createSlice({
  name: 'inbox',
  initialState: {
    counts: { ...emptyCounts },
    isLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInboxCounts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInboxCounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.counts = { ...emptyCounts, ...action.payload };
      })
      .addCase(fetchInboxCounts.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(markInboxRead.fulfilled, (state, action) => {
        state.counts = { ...emptyCounts, ...action.payload };
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.counts = { ...emptyCounts };
      });
  },
});

export default inboxSlice.reducer;
