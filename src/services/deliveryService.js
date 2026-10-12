// deliveryService.js — All API calls for Deliveries
import api from './api';

// POST /api/deliveries  — create a new delivery
export async function createDelivery(data) {
  const response = await api.post('/deliveries', data);
  return response.data;
}

// GET /api/deliveries  — list all deliveries
export async function getAllDeliveries(params = {}) {
  const response = await api.get('/deliveries', { params });
  return response.data;
}

// GET /api/deliveries/:id  — get one delivery
export async function getDeliveryById(id) {
  const response = await api.get(`/deliveries/${id}`);
  return response.data;
}

// PUT /api/deliveries/:id  — update delivery details
export async function updateDelivery(id, data) {
  const response = await api.put(`/deliveries/${id}`, data);
  return response.data;
}

// PATCH /api/deliveries/:id/status  — update delivery status only
// body: { status }
export async function updateDeliveryStatus(id, status) {
  const response = await api.patch(`/deliveries/${id}/status`, { status });
  return response.data;
}

// PATCH /api/deliveries/:id/assign  — assign delivery staff
// body: { delivery_staff_id }
export async function assignDeliveryStaff(id, delivery_staff_id) {
  const response = await api.patch(`/deliveries/${id}/assign`, { delivery_staff_id });
  return response.data;
}
