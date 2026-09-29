import api from './api';

/**
 * Fetch all roles
 * GET /api/roles
 * @returns {Promise<Array>} List of roles
 */
export const getRoles = async () => {
  try {
    const response = await api.get('/api/roles');
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return response.data || [];
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch roles';
    const err = new Error(message);
    err.statusCode = error.response?.status;
    throw err;
  }
};

/**
 * Get role by ID
 * GET /api/roles/:id
 * @param {number|string} id
 */
export const getRoleById = async (id) => {
  try {
    const response = await api.get(`/api/roles/${id}`);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch role details';
    const err = new Error(message);
    err.statusCode = error.response?.status;
    throw err;
  }
};

/**
 * Create a new role with assigned screen IDs
 * POST /api/roles
 * @param {Object} payload
 * @param {string} payload.name
 * @param {string} payload.slug
 * @param {string} [payload.description]
 * @param {Array<number>} payload.screen_ids
 * @returns {Promise<Object>} Created role
 */
export const createRole = async ({ name, slug, description, screen_ids }) => {
  try {
    const response = await api.post('/api/roles', {
      name,
      slug,
      description,
      screen_ids,
    });

    if (response.data && response.data.success) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to create role';
    const err = new Error(message);
    err.statusCode = error.response?.status;
    err.responseData = error.response?.data;
    throw err;
  }
};
