// staffService.js — All API calls for Staff Management
import api from './api';

// POST /api/staff  — create a new staff member (admin only)
// body: { first_name, last_name, email, password, role_id }
export async function createStaff(data) {
  const response = await api.post('/staff', data);
  return response.data;
}

// GET /api/staff  — list all staff
export async function getAllStaff(params = {}) {
  const response = await api.get('/staff', { params });
  return response.data;
}

// GET /api/staff/:id  — get one staff member
export async function getStaffById(id) {
  const response = await api.get(`/staff/${id}`);
  return response.data;
}

// PUT /api/staff/:id  — update staff details (admin only)
export async function updateStaff(id, data) {
  const response = await api.put(`/staff/${id}`, data);
  return response.data;
}

// PATCH /api/staff/:id/status  — activate or deactivate staff
// body: { is_active: true/false }
export async function updateStaffStatus(id, is_active) {
  const response = await api.patch(`/staff/${id}/status`, { is_active });
  return response.data;
}

// GET /api/staff/:staffId/permissions  — get staff-specific permissions
export async function getStaffPermissions(staffId) {
  const response = await api.get(`/staff/${staffId}/permissions`);
  return response.data;
}

// PUT /api/staff/:staffId/permissions  — update staff-specific permissions (admin only)
export async function updateStaffPermissions(staffId, permissionIds) {
  const response = await api.put(`/staff/${staffId}/permissions`, { permissionIds });
  return response.data;
}
