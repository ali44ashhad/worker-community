import { createAsyncThunk, createSlice, isRejectedWithValue } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";
import { getApiBase } from "../utils/apiBase";

const API_URL = getApiBase() || "http://localhost:3001";
axios.defaults.withCredentials = true;

export const getPublicServices = createAsyncThunk(
  "services/getPublic",
  async ({ page = 1, limit = 12 } = {}, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/service-offering`, {
        params: { page, limit },
      });
      return {
        services: res.data.services || [],
        pagination: res.data.pagination || null,
        communityCommunName: null,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch services");
    }
  }
);

export const getCommunityServices = createAsyncThunk(
  "services/getCommunity",
  async ({ page = 1, limit = 12 } = {}, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/service-offering/community`, {
        params: { page, limit },
      });
      return {
        services: res.data.services || [],
        pagination: res.data.pagination || null,
        communityCommunName: res.data.communityCommunName || null,
        needsCommunity: Boolean(res.data.needsCommunity),
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch community services");
    }
  }
);

const initialState = {
  services: [],
  pagination: null,
  communityCommunName: null,
  needsCommunity: false,
  isFetching: false,
  error: null,
};

const serviceSlice = createSlice({
  name: "services",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPublicServices.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(getPublicServices.fulfilled, (state, action) => {
        state.isFetching = false;
        state.services = action.payload?.services || [];
        state.pagination = action.payload?.pagination || null;
        state.communityCommunName = action.payload?.communityCommunName || null;
        state.needsCommunity = false;
      })
      .addCase(getPublicServices.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      })
      .addCase(getCommunityServices.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(getCommunityServices.fulfilled, (state, action) => {
        state.isFetching = false;
        state.services = action.payload?.services || [];
        state.pagination = action.payload?.pagination || null;
        state.communityCommunName = action.payload?.communityCommunName || null;
        state.needsCommunity = Boolean(action.payload?.needsCommunity);
      })
      .addCase(getCommunityServices.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      })
      .addMatcher(isRejectedWithValue(), (state, action) => {
        if (action.payload && typeof action.type === "string" && action.type.startsWith("services/")) {
          toast.error(action.payload);
        }
      });
  },
});

export default serviceSlice.reducer;

