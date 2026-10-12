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

// If the server returns 401 (Unauthorized), clear the session and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('permissions');
      localStorage.removeItem('screens');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
