import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authService } from "../services/authService";
import type { User, LoginCredentials, SignupData } from "../types";
import { getCookie, removeCookie } from "@/core/utils/cookie";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,
  accessToken: null,
  refreshToken: null,
};

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const signup = createAsyncThunk(
  "auth/signup",
  async (data: SignupData, { rejectWithValue }) => {
    try {
      const response = await authService.signup(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Signup failed");
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await authService.logout();
});

export const getMe = createAsyncThunk(
  "auth/getMe",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getMe();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get user"
      );
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Token refresh failed"
      );
    }
  }
);

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { dispatch }) => {
    try {
      // Check cookie first, then localStorage for backward compatibility
      const token =
        getCookie("access_token") || localStorage.getItem("access_token");
      if (token) {
        await dispatch(getMe()).unwrap();
      }
    } catch (error) {
      // Silently fail - user will need to login
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      // Clear auth state immediately without API call
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
    },
    setCredentials: (
      state,
      action: PayloadAction<{
        user: any;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        // Convert Date objects to strings to avoid serialization issues
        const user = { ...action.payload.user };
        if (user.subscription) {
          user.subscription = {
            ...user.subscription,
            startDate:
              user.subscription.startDate instanceof Date
                ? (user.subscription.startDate.toISOString() as any)
                : user.subscription.startDate,
            endDate:
              user.subscription.endDate instanceof Date
                ? (user.subscription.endDate.toISOString() as any)
                : user.subscription.endDate,
          };
        }
        if (user.voiceSubscription) {
          user.voiceSubscription = {
            ...user.voiceSubscription,
            startDate:
              user.voiceSubscription.startDate instanceof Date
                ? (user.voiceSubscription.startDate.toISOString() as any)
                : user.voiceSubscription.startDate,
            endDate:
              user.voiceSubscription.endDate instanceof Date
                ? (user.voiceSubscription.endDate.toISOString() as any)
                : user.voiceSubscription.endDate,
          };
        }
        state.user = user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Signup
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
        // Cookies are removed in authService.logout()
        // Also remove from localStorage for backward compatibility
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      })
      // Get Me
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isLoading = false;
        // Convert Date objects to strings to avoid serialization issues
        // Merge with existing user to preserve transient fields like avatar_url from OAuth redirect
        const user = { ...(state.user || {}), ...action.payload };
        if (user.subscription) {
          user.subscription = {
            ...user.subscription,
            startDate:
              user.subscription.startDate instanceof Date
                ? (user.subscription.startDate.toISOString() as any)
                : user.subscription.startDate,
            endDate:
              user.subscription.endDate instanceof Date
                ? (user.subscription.endDate.toISOString() as any)
                : user.subscription.endDate,
          };
        }
        if (user.voiceSubscription) {
          user.voiceSubscription = {
            ...user.voiceSubscription,
            startDate:
              user.voiceSubscription.startDate instanceof Date
                ? (user.voiceSubscription.startDate.toISOString() as any)
                : user.voiceSubscription.startDate,
            endDate:
              user.voiceSubscription.endDate instanceof Date
                ? (user.voiceSubscription.endDate.toISOString() as any)
                : user.voiceSubscription.endDate,
          };
        }
        state.user = user;
        state.isAuthenticated = true;
      })
      .addCase(getMe.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        // Remove cookies
        removeCookie("access_token", { path: "/" });
        removeCookie("refresh_token", { path: "/" });
        // Also remove from localStorage for backward compatibility
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      })
      // Refresh Token
      .addCase(refreshToken.fulfilled, (state, action) => {
        if (action.payload) {
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
        }
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        // Remove cookies
        removeCookie("access_token", { path: "/" });
        removeCookie("refresh_token", { path: "/" });
        // Also remove from localStorage for backward compatibility
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      })
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        state.isInitializing = true;
      })
      .addCase(initializeAuth.fulfilled, (state) => {
        state.isInitializing = false;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isInitializing = false;
      });
  },
});

export const { clearError, clearAuth, setCredentials } = authSlice.actions;
// Export reducer separately to avoid initialization issues
export const authReducer = authSlice.reducer;
export default authSlice.reducer;
