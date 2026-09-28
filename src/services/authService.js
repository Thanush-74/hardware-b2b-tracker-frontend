import api from './api';

/**
 * Perform login using real backend endpoint POST /api/auth/login
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, user: object, permissions: Array, screens: Array }>}
 */
export const login = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });

    if (response.data && response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data?.message || 'Login failed');
  } catch (error) {
    if (error.response) {
      // Backend returned a non-2xx status code
      const message = error.response.data?.message || 'Invalid credentials or server error';
      const statusCode = error.response.status;
      const customError = new Error(message);
      customError.statusCode = statusCode;
      customError.responseData = error.response.data;
      throw customError;
    } else if (error.request) {
      // Backend is unreachable or network error
      const networkError = new Error('Unable to connect to the backend server. Please verify the backend is running.');
      networkError.isNetworkError = true;
      throw networkError;
    } else {
      throw error;
    }
  }
};

/**
 * Health check to verify backend connectivity
 */
export const checkBackendHealth = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    return null;
  }
};
