/**
 * Auth helper utilities
 * This file provides utilities to clear auth state without creating circular dependencies
 */

let clearAuthCallback: (() => void) | null = null;

/**
 * Register a callback to clear auth state
 * This should be called from the store initialization
 */
export function registerClearAuthCallback(callback: () => void) {
  clearAuthCallback = callback;
}

/**
 * Clear auth state by calling registered callback
 * This can be called from anywhere without circular dependency
 */
export function clearAuthState() {
  if (clearAuthCallback) {
    clearAuthCallback();
  }
}

/**
 * Clear auth storage (cookies and localStorage)
 * This doesn't require Redux store
 * Uses dynamic import to avoid circular dependency with cookie utility
 */
export async function clearAuthStorage() {
  if (typeof window === "undefined") return;

  try {
    // Dynamically import cookie utility to avoid circular dependency
    const { removeCookie } = await import("./cookie");
    removeCookie("access_token", { path: "/" });
    removeCookie("refresh_token", { path: "/" });
  } catch (error) {
    // Fallback: manual cookie clearing if import fails
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name === "access_token" || name === "refresh_token") {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    }
  }

  // Clear localStorage
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

