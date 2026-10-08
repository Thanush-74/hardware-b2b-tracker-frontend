import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT Authorization header
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

// Guard to prevent repeatedly firing unauthorized events from concurrent 401 responses
let isHandlingUnauthorized = false;

// Response interceptor to handle errors cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized (401)
    if (error.response?.status === 401) {
      // Exclude initial login attempts so invalid credentials don't trigger logout events
      const isLoginRequest = error.config?.url?.includes('/api/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('permissions');
        localStorage.removeItem('screens');
        localStorage.removeItem('b2b_tracker_last_activity');
        
        if (typeof window !== 'undefined' && !isHandlingUnauthorized) {
          isHandlingUnauthorized = true;
          window.dispatchEvent(
            new CustomEvent('auth:unauthorized', {
              detail: {
                message: error.response?.data?.message || 'Session expired. Please log in again.',
              },
            })
          );
          setTimeout(() => {
            isHandlingUnauthorized = false;
          }, 1500);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
