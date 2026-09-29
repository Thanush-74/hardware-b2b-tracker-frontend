import api from './api';

/**
 * Fetch all staff members
 * GET /api/staff
 * @param {Object} [params]
 * @returns {Promise<{ total: number, page: number, totalPages: number, staff: Array }>}
 */
export const getStaff = async (params = {}) => {
  try {
    const response = await api.get('/api/staff', { params });
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch staff members';
    const err = new Error(message);
    err.statusCode = error.response?.status;
    throw err;
  }
};

/**
 * Get staff member by ID
 * GET /api/staff/:id
 * @param {number|string} id
 */
export const getStaffById = async (id) => {
  try {
    const response = await api.get(`/api/staff/${id}`);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch staff details';
    const err = new Error(message);
    err.statusCode = error.response?.status;
    throw err;
  }
};

/**
 * Create a new staff / employee account (Admin only)
 * POST /api/staff
 * @param {Object} payload
 * @param {string} payload.first_name
 * @param {string} payload.last_name
 * @param {string} payload.email
 * @param {string} payload.password
 * @param {number|string} payload.role_id
 * @returns {Promise<Object>} Created staff member
 */
export const createStaff = async ({ first_name, last_name, email, password, role_id }) => {
  try {
    const response = await api.post('/api/staff', {
      first_name,
      last_name,
      email,
      password,
      role_id: Number(role_id),
    });

    if (response.data && response.data.success) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to create staff member';
    const err = new Error(message);
    err.statusCode = error.response?.status;
    err.responseData = error.response?.data;
    throw err;
  }
};

/**
 * Update staff active status
 * PATCH /api/staff/:id/status
 * @param {number|string} id
 * @param {boolean} is_active
 */
export const updateStaffStatus = async (id, is_active) => {
  try {
    const response = await api.patch(`/api/staff/${id}/status`, { is_active });
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update staff status';
    const err = new Error(message);
    err.statusCode = error.response?.status;
    throw err;
  }
};
