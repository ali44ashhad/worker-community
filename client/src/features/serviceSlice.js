import { createAsyncThunk, createSlice, isRejectedWithValue } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";
import { getApiBase } from "../utils/apiBase";
import { shouldToastApiMessage } from "../utils/apiToast";

const API_URL = getApiBase();
axios.defaults.withCredentials = true;

const listParams = ({
  page = 1,
  limit = 12,
  search,
  category,
  subcategory,
  keyword,
  minRating,
  sort,
} = {}) => {
  const params = { page, limit };
  if (search) params.search = search;
  if (category) params.category = category;
  if (subcategory) params.subcategory = subcategory;
  if (keyword) params.keyword = keyword;
  if (minRating) params.minRating = minRating;
  if (sort) params.sort = sort;
  return params;
};

export const getPublicServices = createAsyncThunk(
  "services/getPublic",
  async (args = {}, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/service-offering`, {
        params: listParams(args),
      });
      return {
        services: res.data.services || [],
        pagination: res.data.pagination || null,
        categories: res.data.categories || [],
        subcategories: res.data.subcategories || [],
        communityCommunName: null,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch services");
    }
  }
);

export const getCommunityServices = createAsyncThunk(
  "services/getCommunity",
  async (args = {}, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/service-offering/community`, {
        params: listParams(args),
      });
      return {
        services: res.data.services || [],
        pagination: res.data.pagination || null,
        categories: res.data.categories || [],
        subcategories: res.data.subcategories || [],
        communityCommunName: res.data.communityCommunName || null,
        needsCommunity: Boolean(res.data.needsCommunity),
        publicServices: Boolean(res.data.publicServices),
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch community services");
    }
  }
);

const emptyCatalog = () => ({
  services: [],
  pagination: null,
  categories: [],
  subcategories: [],
  communityCommunName: null,
  needsCommunity: false,
  publicServices: false,
  isFetching: false,
  error: null,
  requestId: null,
});

const markPending = (catalog, requestId) => {
  catalog.isFetching = true;
  catalog.error = null;
  catalog.requestId = requestId;
};

const markFulfilled = (catalog, action) => {
  if (catalog.requestId !== action.meta.requestId) return;
  catalog.isFetching = false;
  catalog.services = action.payload?.services || [];
  catalog.pagination = action.payload?.pagination || null;
  catalog.categories = action.payload?.categories || [];
  catalog.subcategories = action.payload?.subcategories || [];
  catalog.communityCommunName = action.payload?.communityCommunName || null;
  catalog.needsCommunity = Boolean(action.payload?.needsCommunity);
  catalog.publicServices = Boolean(action.payload?.publicServices);
  catalog.error = null;
};

const markRejected = (catalog, action) => {
  if (catalog.requestId !== action.meta.requestId) return;
  catalog.isFetching = false;
  catalog.error = action.payload;
};

const initialState = {
  publicCatalog: emptyCatalog(),
  communityCatalog: emptyCatalog(),
};

const serviceSlice = createSlice({
  name: "services",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPublicServices.pending, (state, action) => {
        markPending(state.publicCatalog, action.meta.requestId);
      })
      .addCase(getPublicServices.fulfilled, (state, action) => {
        markFulfilled(state.publicCatalog, action);
      })
      .addCase(getPublicServices.rejected, (state, action) => {
        markRejected(state.publicCatalog, action);
      })
      .addCase(getCommunityServices.pending, (state, action) => {
        markPending(state.communityCatalog, action.meta.requestId);
      })
      .addCase(getCommunityServices.fulfilled, (state, action) => {
        markFulfilled(state.communityCatalog, action);
      })
      .addCase(getCommunityServices.rejected, (state, action) => {
        markRejected(state.communityCatalog, action);
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
