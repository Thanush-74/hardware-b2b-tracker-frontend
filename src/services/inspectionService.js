// inspectionService.js — All API calls for Quality Inspections
import api from './api';

// GET /api/inspections/summary  — quality summary metrics
export async function getInspectionSummary() {
  const response = await api.get('/inspections/summary');
  return response.data;
}

// GET /api/inspections  — list all inspections
export async function getAllInspections(params = {}) {
  const response = await api.get('/inspections', { params });
  return response.data;
}

// GET /api/inspections/:id  — get one inspection
export async function getInspectionById(id) {
  const response = await api.get(`/inspections/${id}`);
  return response.data;
}

// POST /api/inspections  — create a new inspection record
export async function createInspection(data) {
  const response = await api.post('/inspections', data);
  return response.data;
}

// PUT /api/inspections/:id  — update an inspection
export async function updateInspection(id, data) {
  const response = await api.put(`/inspections/${id}`, data);
  return response.data;
}

// PUT /api/inspections/:id/approve  — approve inspection and post accepted units to inventory
export async function approveInspection(id) {
  const response = await api.put(`/inspections/${id}/approve`);
  return response.data;
}

// DELETE /api/inspections/:id  — delete an inspection
export async function deleteInspection(id) {
  const response = await api.delete(`/inspections/${id}`);
  return response.data;
}
