import api from './api';

// Helper to unwrap standard backend { success: true, data: ... } responses
const handleResponse = async (promise) => {
  try {
    const response = await promise;
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'API request failed';
    const err = new Error(message);
    err.statusCode = error.response?.status;
    err.responseData = error.response?.data;
    throw err;
  }
};

/**
 * 1. Products API Service
 */
export const productService = {
  getAll: (params) => handleResponse(api.get('/api/products', { params })),
  getById: (id) => handleResponse(api.get(`/api/products/${id}`)),
  create: (data) => handleResponse(api.post('/api/products', data)),
  update: (id, data) => handleResponse(api.put(`/api/products/${id}`, data)),
  delete: (id) => handleResponse(api.delete(`/api/products/${id}`)),
};

/**
 * 2. Inventory API Service
 */
export const inventoryService = {
  getAll: (params) => handleResponse(api.get('/api/inventory', { params })),
  getById: (id) => handleResponse(api.get(`/api/inventory/${id}`)),
  updateStock: (id, data) => handleResponse(api.put(`/api/inventory/${id}`, data)),
  increase: (id, amount) => handleResponse(api.post(`/api/inventory/${id}/increase`, { amount: Number(amount) })),
  decrease: (id, amount) => handleResponse(api.post(`/api/inventory/${id}/decrease`, { amount: Number(amount) })),
};

/**
 * 3. Orders API Service
 */
export const orderService = {
  getAll: (params) => handleResponse(api.get('/api/orders', { params })),
  getById: (id) => handleResponse(api.get(`/api/orders/${id}`)),
  create: (data) => handleResponse(api.post('/api/orders', data)),
  updateStatus: (id, status) => handleResponse(api.patch(`/api/orders/${id}/status`, { order_status: status })),
  updatePayment: (id, paymentData) =>
    handleResponse(
      api.patch(
        `/api/orders/${id}/payment`,
        typeof paymentData === 'string' ? { payment_status: paymentData } : paymentData
      )
    ),
};

/**
 * 4. Deliveries API Service
 */
export const deliveryService = {
  getAll: (params) => handleResponse(api.get('/api/deliveries', { params })),
  getById: (id) => handleResponse(api.get(`/api/deliveries/${id}`)),
  create: (data) => handleResponse(api.post('/api/deliveries', data)),
  updateStatus: (id, status) => handleResponse(api.patch(`/api/deliveries/${id}/status`, { status })),
  assignStaff: (id, delivery_staff_id) =>
    handleResponse(api.patch(`/api/deliveries/${id}/assign`, { delivery_staff_id })),
};

/**
 * 5. Cart API Service
 */
export const cartService = {
  getCart: () => handleResponse(api.get('/api/cart')),
  addItem: (product_id, quantity) => handleResponse(api.post('/api/cart', { product_id, quantity })),
  updateItem: (id, quantity) => handleResponse(api.put(`/api/cart/${id}`, { quantity })),
  removeItem: (id) => handleResponse(api.delete(`/api/cart/${id}`)),
  clear: () => handleResponse(api.delete('/api/cart')),
};

/**
 * 6. Production API Service
 */
export const productionService = {
  getAll: (params) => handleResponse(api.get('/api/production', { params })),
  getById: (id) => handleResponse(api.get(`/api/production/${id}`)),
  create: (data) => handleResponse(api.post('/api/production', data)),
  update: (id, data) => handleResponse(api.put(`/api/production/${id}`, data)),
  updateStatus: (id, status) => handleResponse(api.patch(`/api/production/${id}/status`, { status })),
};

/**
 * 7. Returns & Replacement API Service
 */
export const returnService = {
  getAll: (params) => handleResponse(api.get('/api/returns', { params })),
  getById: (id) => handleResponse(api.get(`/api/returns/${id}`)),
  create: (data) => handleResponse(api.post('/api/returns', data)),
  update: (id, data) => handleResponse(api.put(`/api/returns/${id}`, data)),
  updateStatus: (id, status) => handleResponse(api.patch(`/api/returns/${id}/status`, { status })),
  recordReplacement: (id, data) => handleResponse(api.patch(`/api/returns/${id}/replacement`, data)),
};

/**
 * 8. Manufacturing API Service
 */
export const manufacturingService = {
  getSummary: () => handleResponse(api.get('/api/manufacturing/summary')),
  getAssignments: (params) => handleResponse(api.get('/api/manufacturing', { params })),
  getById: (id) => handleResponse(api.get(`/api/manufacturing/${id}`)),
  create: (data) => handleResponse(api.post('/api/manufacturing', data)),
  update: (id, data) => handleResponse(api.put(`/api/manufacturing/${id}`, data)),
  delete: (id) => handleResponse(api.delete(`/api/manufacturing/${id}`)),
};

/**
 * 9. Expense API Service
 */
export const expenseService = {
  getSummary: (params) => handleResponse(api.get('/api/expenses/summary', { params })),
  getAll: (params) => handleResponse(api.get('/api/expenses', { params })),
  getById: (id) => handleResponse(api.get(`/api/expenses/${id}`)),
  create: (data) => handleResponse(api.post('/api/expenses', data)),
  update: (id, data) => handleResponse(api.put(`/api/expenses/${id}`, data)),
  delete: (id) => handleResponse(api.delete(`/api/expenses/${id}`)),
};

/**
 * 10. Inspection API Service
 */
export const inspectionService = {
  getSummary: (params) => handleResponse(api.get('/api/inspections/summary', { params })),
  getAll: (params) => handleResponse(api.get('/api/inspections', { params })),
  getById: (id) => handleResponse(api.get(`/api/inspections/${id}`)),
  create: (data) => handleResponse(api.post('/api/inspections', data)),
  update: (id, data) => handleResponse(api.put(`/api/inspections/${id}`, data)),
  delete: (id) => handleResponse(api.delete(`/api/inspections/${id}`)),
};
