import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";
import { getApiBase } from "../utils/apiBase";

const API_URL = getApiBase() || "http://localhost:3000";
axios.defaults.withCredentials = true;

export const fetchInterestCommunities = createAsyncThunk(
  "interestCommunity/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/interest-communities`);
      return res.data?.data || {};
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load communities");
    }
  }
);

export const joinInterestCommunity = createAsyncThunk(
  "interestCommunity/join",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/api/interest-communities/${id}/join`);
      toast.success(res.data?.message || "Joined community.");
      return id;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to join";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const leaveInterestCommunity = createAsyncThunk(
  "interestCommunity/leave",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/api/interest-communities/${id}/leave`);
      toast.success(res.data?.message || "Left community.");
      return id;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to leave";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const fetchAdminInterestCommunities = createAsyncThunk(
  "interestCommunity/fetchAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/interest-communities`);
      return res.data?.data?.communities || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load communities");
    }
  }
);

export const createAdminInterestCommunity = createAsyncThunk(
  "interestCommunity/createAdmin",
  async (name, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/api/admin/interest-communities`, { name });
      toast.success(res.data?.message || "Community created.");
      return res.data?.data?.community;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const toggleAdminInterestCommunity = createAsyncThunk(
  "interestCommunity/toggleAdmin",
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${API_URL}/api/admin/interest-communities/${id}/toggle`, {
        isActive,
      });
      return res.data?.data?.community;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

const interestCommunitySlice = createSlice({
  name: "interestCommunity",
  initialState: {
    communities: [],
    communName: null,
    communLabel: null,
    needsCommunName: false,
    loading: false,
    error: null,
    joiningId: null,
    adminCommunities: [],
    adminLoading: false,
    adminSaving: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInterestCommunities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInterestCommunities.fulfilled, (state, action) => {
        state.loading = false;
        state.communities = action.payload.communities || [];
        state.communName = action.payload.communName || null;
        state.communLabel = action.payload.communLabel || null;
        state.needsCommunName = Boolean(action.payload.needsCommunName);
      })
      .addCase(fetchInterestCommunities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(joinInterestCommunity.pending, (state, action) => {
        state.joiningId = action.meta.arg;
      })
      .addCase(joinInterestCommunity.fulfilled, (state, action) => {
        state.joiningId = null;
        state.communities = state.communities.map((c) =>
          String(c._id) === String(action.payload) ? { ...c, joined: true } : c
        );
      })
      .addCase(joinInterestCommunity.rejected, (state) => {
        state.joiningId = null;
      })
      .addCase(leaveInterestCommunity.fulfilled, (state, action) => {
        state.communities = state.communities.map((c) =>
          String(c._id) === String(action.payload) ? { ...c, joined: false } : c
        );
      })
      .addCase(fetchAdminInterestCommunities.pending, (state) => {
        state.adminLoading = true;
      })
      .addCase(fetchAdminInterestCommunities.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminCommunities = action.payload;
      })
      .addCase(fetchAdminInterestCommunities.rejected, (state) => {
        state.adminLoading = false;
      })
      .addCase(createAdminInterestCommunity.fulfilled, (state, action) => {
        if (action.payload) state.adminCommunities.unshift(action.payload);
      })
      .addCase(toggleAdminInterestCommunity.pending, (state) => {
        state.adminSaving = true;
      })
      .addCase(toggleAdminInterestCommunity.fulfilled, (state, action) => {
        state.adminSaving = false;
        if (!action.payload) return;
        state.adminCommunities = state.adminCommunities.map((c) =>
          String(c._id) === String(action.payload._id) ? { ...c, ...action.payload } : c
        );
      })
      .addCase(toggleAdminInterestCommunity.rejected, (state) => {
        state.adminSaving = false;
      });
  },
});

export default interestCommunitySlice.reducer;
