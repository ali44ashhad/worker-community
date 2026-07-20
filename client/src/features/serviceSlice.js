import { createAsyncThunk, createSlice, isRejectedWithValue } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";
import { getApiBase } from "../utils/apiBase";
import { shouldToastApiMessage } from "../utils/apiToast";

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

const fetchAllServicePages = async (url, baseParams = {}) => {
  const limit = 50;
  let page = 1;
  let allServices = [];
  let pagination = null;
  let communityCommunName = null;
  let needsCommunity = false;
  let publicServices = false;

  while (true) {
    const res = await axios.get(url, { params: { ...baseParams, page, limit } });
    const batch = res.data.services || [];
    allServices = allServices.concat(batch);
    pagination = res.data.pagination || null;
    communityCommunName = res.data.communityCommunName ?? communityCommunName;
    needsCommunity = Boolean(res.data.needsCommunity);
    publicServices = Boolean(res.data.publicServices) || publicServices;

    if (needsCommunity || !pagination?.totalPages || page >= pagination.totalPages) {
      break;
    }
    page += 1;
  }

  return {
    services: allServices,
    pagination: pagination
      ? { ...pagination, page: 1, limit, total: allServices.length, totalPages: 1 }
      : { page: 1, limit, total: allServices.length, totalPages: 1 },
    communityCommunName,
    needsCommunity,
    publicServices,
  };
};

export const getAllPublicServices = createAsyncThunk(
  "services/getAllPublic",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAllServicePages(`${API_URL}/api/service-offering`);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch services");
    }
  }
);

export const getAllCommunityServices = createAsyncThunk(
  "services/getAllCommunity",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAllServicePages(`${API_URL}/api/service-offering/community`);
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
  publicServices: false,
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
        state.publicServices = false;
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
        state.publicServices = Boolean(action.payload?.publicServices);
      })
      .addCase(getCommunityServices.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      })
      .addCase(getAllPublicServices.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(getAllPublicServices.fulfilled, (state, action) => {
        state.isFetching = false;
        state.services = action.payload?.services || [];
        state.pagination = action.payload?.pagination || null;
        state.communityCommunName = action.payload?.communityCommunName || null;
        state.needsCommunity = false;
        state.publicServices = false;
      })
      .addCase(getAllPublicServices.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      })
      .addCase(getAllCommunityServices.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(getAllCommunityServices.fulfilled, (state, action) => {
        state.isFetching = false;
        state.services = action.payload?.services || [];
        state.pagination = action.payload?.pagination || null;
        state.communityCommunName = action.payload?.communityCommunName || null;
        state.needsCommunity = Boolean(action.payload?.needsCommunity);
        state.publicServices = Boolean(action.payload?.publicServices);
      })
      .addCase(getAllCommunityServices.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      })
      .addMatcher(isRejectedWithValue(), (state, action) => {
        if (action.payload && typeof action.type === "string" && action.type.startsWith("services/")) {
          if (shouldToastApiMessage(action.payload)) {
            toast.error(action.payload);
          }
        }
      });
  },
});

export default serviceSlice.reducer;

