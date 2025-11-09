import { useEffect, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAppDispatch, useAppSelector } from "./core/store/hooks";
import { initializeAuth, getMe } from "./features/auth/store/authSlice";
import { setDarkMode } from "./features/ui/store/uiSlice";
import { settingsService } from "./features/auth/services/settingsService";
import { routes } from "./core/router";
import LoadingScreen from "./components/LoadingScreen";
import "./App.css";

function AppContent() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isAuthenticated = useAppSelector(
    (state) => state.auth?.isAuthenticated ?? false
  );
  const user = useAppSelector((state) => state.auth?.user);
  const accessToken = useAppSelector((state) => state.auth?.accessToken);
  const isInitializing = useAppSelector(
    (state) => state.auth?.isInitializing ?? true
  );
  const isLoading = useAppSelector((state) => state.auth?.isLoading ?? false);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Fetch user data when route changes and user is authenticated
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      dispatch(getMe());
    }
  }, [location.pathname, dispatch, isAuthenticated, accessToken]);

  // Initialize theme from settings
  useEffect(() => {
    const userId = user?.email || user?.id || null;
    const settings = settingsService.getSettings(userId);

    // Apply theme
    if (settings.theme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      dispatch(setDarkMode(prefersDark));
    } else {
      dispatch(setDarkMode(settings.theme === "dark"));
    }

    // Apply fontSize
    const root = document.documentElement;
    if (settings.fontSize === "small") {
      root.style.fontSize = "14px";
    } else if (settings.fontSize === "medium") {
      root.style.fontSize = "16px";
    } else if (settings.fontSize === "large") {
      root.style.fontSize = "18px";
    }

    // Listen for system theme changes
    if (settings.theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        dispatch(setDarkMode(e.matches));
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [dispatch, user]);

  // Show loading screen while initializing auth
  if (isInitializing) {
    return <LoadingScreen />;
  }

  return (
    <div className="App">
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {routes.map((route) => {
            // Check if route requires authentication
            if (route.protected && !isAuthenticated) {
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={<Navigate to="/login" replace />}
                />
              );
            }

            // Check if route requires admin role
            if (route.adminOnly) {
              // If user data is still loading, show loading screen
              if (isAuthenticated && !user && isLoading) {
                return (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={<LoadingScreen />}
                  />
                );
              }
              
              // Check if user has admin role
              const isAdmin = user?.role === "admin" || user?.role === "super_admin";
              if (!isAdmin) {
                return (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={<Navigate to="/app" replace />}
                  />
                );
              }
            }

            // Render the route normally
            return (
              <Route
                key={route.path}
                path={route.path}
                element={<route.component />}
              />
            );
          })}
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </Suspense>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="auto"
      />
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
