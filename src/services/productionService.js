// productionService.js — All API calls for Production Records
import api from './api';

// POST /api/production  — create a new production record
export async function createProduction(data) {
  const response = await api.post('/production', data);
  return response.data;
}

// GET /api/production  — list all production records
export async function getAllProduction(params = {}) {
  const response = await api.get('/production', { params });
  return response.data;
}

// GET /api/production/product/:productId  — get production records for a specific product
export async function getProductionByProductId(productId) {
  const response = await api.get(`/production/product/${productId}`);
  return response.data;
}

// GET /api/production/:id  — get one production record
export async function getProductionById(id) {
  const response = await api.get(`/production/${id}`);
  return response.data;
}

// PUT /api/production/:id  — update a production record
export async function updateProduction(id, data) {
  const response = await api.put(`/production/${id}`, data);
  return response.data;
}

// PATCH /api/production/:id/status  — update production status only
// body: { status }  — allowed: Planned, In Production, Completed, Cancelled
export async function updateProductionStatus(id, status) {
  const response = await api.patch(`/production/${id}/status`, { status });
  return response.data;
}
