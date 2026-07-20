import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getApiBase } from "../utils/apiBase";

const API_URL = getApiBase() || "http://localhost:3001";
axios.defaults.withCredentials = true;

// ========================== SIGNUP ==========================
export const signupUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/user/register`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Registration failed");
    }
  }
);

// ========================== LOGIN WITH PHONE OTP ==========================
export const loginWithPhoneOtp = createAsyncThunk(
  "auth/loginWithPhoneOtp",
  async ({ phoneNumber, code }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/user/login/verify-otp`, {
        phoneNumber,
        code,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// ========================== LOGIN ==========================
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/user/login`, credentials);
      return response.data; // expected { user, token, message }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// ========================== CHECK AUTH ==========================
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/user/check-auth`);
      return response.data; // expected { user, message }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Checking authentication failed");
    }
  }
);

// ========================== LOGOUT ==========================
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/user/logout`);
      return response.data; // expected { message: "Logout successful" }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

// ========================== JOIN COMMUNITY ==========================
export const joinCommunity = createAsyncThunk(
  "auth/joinCommunity",
  async (communityCommunName, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/user/join-community`, {
        communityCommunName,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Could not join community");
    }
  }
);

// ========================== UPDATE PROFILE ==========================
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/api/user/update-profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Profile update failed");
    }
  }
);

// ========================== CHANGE PASSWORD ==========================
export const changePasswordUser = createAsyncThunk(
  "auth/changePassword",
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/api/user/change-password`, {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Password update failed");
    }
  }
);    
const initialState = {
  user: null,
  isLoading: false,
  isCheckingAuth: true, // for initial auth check
  error: null,
};

// ========================== SLICE ==========================
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthSession(state) {
      state.user = null;
      state.isLoading = false;
      state.isCheckingAuth = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ---------- SIGNUP ----------
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.error = action.payload;
      })

      // ---------- LOGIN ----------
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.error = action.payload;
      })

      // ---------- LOGIN WITH PHONE OTP ----------
      .addCase(loginWithPhoneOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithPhoneOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
      })
      .addCase(loginWithPhoneOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.error = action.payload;
      })

      // ---------- CHECK AUTH ----------
      .addCase(checkAuth.pending, (state) => {
        state.isCheckingAuth = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.user = action.payload.user;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isCheckingAuth = false;
        state.user = null;
        state.error = action.payload;
      })

      // ---------- LOGOUT ----------
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ---------- UPDATE PROFILE ----------
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ---------- JOIN COMMUNITY ----------
      .addCase(joinCommunity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(joinCommunity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
      })
      .addCase(joinCommunity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ---------- CHANGE PASSWORD ----------
      .addCase(changePasswordUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePasswordUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changePasswordUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAuthSession } = authSlice.actions;
export default authSlice.reducer;