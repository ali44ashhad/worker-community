import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
axios.defaults.withCredentials = true;

export const fetchCommentsByService = createAsyncThunk(
  "comments/fetchByService",
  async (serviceId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/comments/get-comments/${serviceId}`);
      return { serviceId, comments: res.data.comments };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load comments");
    }
  }
);

export const createServiceComment = createAsyncThunk(
  "comments/create",
  async ({ serviceId, comment }, { rejectWithValue, getState }) => {
    try {
      const res = await axios.post(`${API_URL}/api/comments/create-comment/${serviceId}`, { comment });
      const state = getState();
      const currentUser = state?.auth?.user;
      // Enrich the returned comment with current user's info for immediate UI display
      const enriched = {
        ...res.data.comment,
        customer: res.data.comment?.customer && typeof res.data.comment.customer === 'object'
          ? res.data.comment.customer
          : {
              _id: currentUser?._id,
              name: currentUser?.name,
              profileImage: currentUser?.profileImage,
            },
      };
      return { serviceId, comment: enriched };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to post comment");
    }
  }
);

export const updateServiceComment = createAsyncThunk(
  "comments/update",
  async ({ commentId, comment }, { rejectWithValue, getState }) => {
    try {
      const res = await axios.put(`${API_URL}/api/comments/update-comment/${commentId}`, { comment });
      const state = getState();
      const currentUser = state?.auth?.user;
      const updated = res.data.comment || {};
      // Ensure customer object is present for immediate UI display
      const enriched = {
        ...updated,
        customer: updated?.customer && typeof updated.customer === 'object'
          ? updated.customer
          : {
              _id: currentUser?._id,
              name: currentUser?.name,
              profileImage: currentUser?.profileImage,
            },
      };
      return enriched;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update comment");
    }
  }
);

export const deleteServiceComment = createAsyncThunk(
  "comments/delete",
  async ({ commentId }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/api/comments/delete/${commentId}`);
      return commentId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete comment");
    }
  }
);

const initialState = {
  byServiceId: {},
  isLoading: false,
  error: null,
};

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommentsByService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCommentsByService.fulfilled, (state, action) => {
        state.isLoading = false;
        const { serviceId, comments } = action.payload;
        state.byServiceId[serviceId] = comments;
      })
      .addCase(fetchCommentsByService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(createServiceComment.pending, (state) => {
        state.error = null;
      })
      .addCase(createServiceComment.fulfilled, (state, action) => {
        const { serviceId, comment } = action.payload;
        if (!state.byServiceId[serviceId]) state.byServiceId[serviceId] = [];
        state.byServiceId[serviceId].unshift(comment);
      })
      .addCase(createServiceComment.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(updateServiceComment.fulfilled, (state, action) => {
        // Find and replace the updated comment in all services
        const updated = action.payload;
        for (const key of Object.keys(state.byServiceId)) {
          const idx = state.byServiceId[key]?.findIndex(c => c._id === updated._id);
          if (idx !== -1) {
            state.byServiceId[key][idx] = updated;
          }
        }
      })

      .addCase(deleteServiceComment.fulfilled, (state, action) => {
        const id = action.payload;
        for (const key of Object.keys(state.byServiceId)) {
          state.byServiceId[key] = state.byServiceId[key]?.filter(c => c._id !== id) || [];
        }
      });
  },
});

export default commentSlice.reducer;


