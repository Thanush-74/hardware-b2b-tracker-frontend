import api from './api';

/**
 * Fetch all available screens from the backend
 * GET /api/screens
 * @returns {Promise<Array>} Array of screen objects
 */
export const getScreens = async () => {
  try {
    const response = await api.get('/api/screens');
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return response.data || [];
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch screens';
    const err = new Error(message);
    err.statusCode = error.response?.status;
    throw err;
  }
};
