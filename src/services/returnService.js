// returnService.js — All API calls for Returns & Replacements
import api from './api';

// POST /api/returns  — create a new return request
export async function createReturn(data) {
  const response = await api.post('/returns', data);
  return response.data;
}

// GET /api/returns  — list all returns
export async function getAllReturns(params = {}) {
  const response = await api.get('/returns', { params });
  return response.data;
}

// GET /api/returns/:id  — get one return record
export async function getReturnById(id) {
  const response = await api.get(`/returns/${id}`);
  return response.data;
}

// PUT /api/returns/:id  — update general return info
export async function updateReturn(id, data) {
  const response = await api.put(`/returns/${id}`, data);
  return response.data;
}

// PATCH /api/returns/:id/status  — update return status only
// body: { status }
export async function updateReturnStatus(id, status) {
  const response = await api.patch(`/returns/${id}/status`, { status });
  return response.data;
}

// PATCH /api/returns/:id/replacement  — record replacement details
// body: { replacement_product_id, replacement_quantity }
export async function recordReplacement(id, data) {
  const response = await api.patch(`/returns/${id}/replacement`, data);
  return response.data;
}
