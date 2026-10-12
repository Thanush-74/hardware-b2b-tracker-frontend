// orderService.js — All API calls for Orders
import api from './api';

// POST /api/orders  — create a new customer order
export async function createOrder(orderData) {
  const response = await api.post('/orders', orderData);
  return response.data;
}

// GET /api/orders  — list all orders
export async function getAllOrders(params = {}) {
  const response = await api.get('/orders', { params });
  return response.data;
}

// GET /api/orders/:id  — get one order by ID or order_number
export async function getOrderById(id) {
  const response = await api.get(`/orders/${id}`);
  return response.data;
}

// PUT /api/orders/:id  — update general order info
export async function updateOrder(id, data) {
  const response = await api.put(`/orders/${id}`, data);
  return response.data;
}

// PATCH /api/orders/:id/status  — update order status only
// body: { order_status }
export async function updateOrderStatus(id, order_status) {
  const response = await api.patch(`/orders/${id}/status`, { order_status });
  return response.data;
}

// PATCH /api/orders/:id/payment  — update payment status only
// body: { payment_status, payment_amount }
export async function updatePaymentStatus(id, data) {
  const response = await api.patch(`/orders/${id}/payment`, data);
  return response.data;
}
