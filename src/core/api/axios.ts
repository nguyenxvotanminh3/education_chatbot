import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getCookie } from "../utils/cookie";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "/api",
  withCredentials: true, // Important: enables cookies (ci cookie for guest ID)
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add timezone header
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    config.headers["Time-Zone"] = timeZone;

    // Add authorization header if token exists (check cookie first, then localStorage for backward compatibility)
    const token =
      getCookie("access_token") || localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with refresh token logic
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if this is a guest request (no token was sent)
      const hasToken =
        getCookie("access_token") || localStorage.getItem("access_token");

      // If no token, this might be a guest request - don't try to refresh
      if (!hasToken) {
        // Guest users don't have tokens, so 401 is expected for some endpoints
        // But chat endpoint should allow guest, so just reject the error
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh token using direct API call to avoid circular dependency
        const refreshTokenValue =
          getCookie("refresh_token") || localStorage.getItem("refresh_token");
        if (refreshTokenValue) {
          const refreshResponse = await axios.post(
            `${
              import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "/api"
            }/auth/refresh`,
            {},
            { withCredentials: true }
          );
          if (
            refreshResponse.data?.access_token ||
            refreshResponse.data?.accessToken
          ) {
            // Token will be set by backend in cookie, but also update cookie here for consistency
            const newAccessToken =
              refreshResponse.data.access_token ||
              refreshResponse.data.accessToken;
            if (newAccessToken && typeof window !== "undefined") {
              const { setCookie } = await import("../utils/cookie");
              setCookie("access_token", newAccessToken, {
                expires: 0.25,
                path: "/",
                secure: import.meta.env.PROD,
                sameSite: "lax",
              });
            }
            processQueue(null, null);
            return apiClient(originalRequest);
          }
        }
        throw new Error("No refresh token");
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        // Redirect to login if refresh fails
        const path = window.location.pathname;
        const requiresAuth =
          path.startsWith("/home") || path.startsWith("/admin");
        if (requiresAuth) {
          if (typeof window !== "undefined") {
            const { removeCookie } = await import("../utils/cookie");
            removeCookie("access_token", { path: "/" });
            removeCookie("refresh_token", { path: "/" });
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
          }
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      const path = window.location.pathname;
      if (!path.startsWith("/admin")) {
        window.location.href = "/home";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
