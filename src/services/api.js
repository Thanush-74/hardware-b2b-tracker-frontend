// api.js — Shared Axios instance for all API calls
// All requests go through this file so we only write the base URL once.

import axios from 'axios';

// Read the base URL from the .env file (VITE_ prefix required by Vite)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Create one axios instance that every service module will use
const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Before every request, attach the JWT token from localStorage (if logged in)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Callback registered by AuthContext to synchronize in-memory React auth state
let unauthorizedHandler = null;
let isHandling401 = false;

/**
 * Register a callback to be notified when an authenticated API call receives a 401.
 * Allows AuthContext to clear its internal state and redirect cleanly.
 */
export function registerUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = null;
    }
  };
}

// If the server returns 401 (Unauthorized) on an authenticated request,
// clear credentials, notify AuthContext, and redirect to login without looping
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginEndpoint = error.config?.url?.includes('/auth/login');

    if (error.response && error.response.status === 401 && !isLoginEndpoint) {
      // 1. Clear authentication data stored in localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('permissions');
      localStorage.removeItem('screens');

      // 2. Prevent duplicate redirect loops if multiple requests fail with 401 simultaneously
      if (!isHandling401) {
        isHandling401 = true;
        setTimeout(() => {
          isHandling401 = false;
        }, 2000);

        // 3. Clear AuthContext state if registered, or fallback to redirect
        if (typeof unauthorizedHandler === 'function') {
          unauthorizedHandler();
        } else if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
