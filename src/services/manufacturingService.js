// manufacturingService.js — All API calls for Manufacturing Assignments
import api from './api';

// GET /api/manufacturing/summary  — sector summary stats
export async function getManufacturingSummary() {
  const response = await api.get('/manufacturing/summary');
  return response.data;
}

// GET /api/manufacturing  — list all assignments
export async function getAllAssignments(params = {}) {
  const response = await api.get('/manufacturing', { params });
  return response.data;
}

// GET /api/manufacturing/:id  — get one assignment
export async function getAssignmentById(id) {
  const response = await api.get(`/manufacturing/${id}`);
  return response.data;
}

// POST /api/manufacturing  — create a new assignment
// body: { staff_id, sector, product_id, start_date, end_date, status, shift, notes }
export async function createAssignment(data) {
  const response = await api.post('/manufacturing', data);
  return response.data;
}

// PUT /api/manufacturing/:id  — update an assignment
export async function updateAssignment(id, data) {
  const response = await api.put(`/manufacturing/${id}`, data);
  return response.data;
}

// DELETE /api/manufacturing/:id  — delete an assignment
export async function deleteAssignment(id) {
  const response = await api.delete(`/manufacturing/${id}`);
  return response.data;
}
