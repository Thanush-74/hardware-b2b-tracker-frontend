// inventoryService.js — All API calls for Inventory
import api from './api';

// GET /api/inventory  — view all inventory records
export async function getAllInventory(params = {}) {
  const response = await api.get('/inventory', { params });
  return response.data;
}

// GET /api/inventory/:id  — view a single inventory record
export async function getInventoryById(id) {
  const response = await api.get(`/inventory/${id}`);
  return response.data;
}

// PUT /api/inventory/:id  — update stock directly (set exact quantity)
// body: { quantity, reserved_quantity, location }
export async function updateStock(id, data) {
  const response = await api.put(`/inventory/${id}`, data);
  return response.data;
}

// POST /api/inventory/:id/increase  — increase stock by an amount
// body: { quantity }
export async function increaseStock(id, quantity) {
  const response = await api.post(`/inventory/${id}/increase`, { quantity });
  return response.data;
}

// POST /api/inventory/:id/decrease  — decrease stock by an amount
// body: { quantity }
export async function decreaseStock(id, quantity) {
  const response = await api.post(`/inventory/${id}/decrease`, { quantity });
  return response.data;
}
