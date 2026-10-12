// roleService.js — All API calls for Roles & Permissions
import api from './api';

// GET /api/roles  — list all roles
export async function getAllRoles() {
  const response = await api.get('/roles');
  return response.data;
}

// GET /api/roles/:id  — get one role
export async function getRoleById(id) {
  const response = await api.get(`/roles/${id}`);
  return response.data;
}

// POST /api/roles  — create a new role (admin only)
// body: { slug, name, description }
export async function createRole(data) {
  const response = await api.post('/roles', data);
  return response.data;
}

// GET /api/roles/:roleId/permissions  — get permissions assigned to a role
export async function getRolePermissions(roleId) {
  const response = await api.get(`/roles/${roleId}/permissions`);
  return response.data;
}

// PUT /api/roles/:roleId/permissions  — update permissions/screens for a role (admin only)
// body: { permission_ids: [1,2,3,...], screen_ids: [1,2,...] }
export async function updateRolePermissions(roleId, permissionIds, screenIds) {
  const payload = {};
  if (Array.isArray(permissionIds)) {
    payload.permission_ids = permissionIds;
  }
  if (Array.isArray(screenIds)) {
    payload.screen_ids = screenIds;
  }
  const response = await api.put(`/roles/${roleId}/permissions`, payload);
  return response.data;
}

// Update role screen assignments (admin only)
export async function updateRoleScreens(roleId, screenIds, permissionIds) {
  return updateRolePermissions(roleId, permissionIds, screenIds);
}

// GET /api/permissions  — list all available permissions
export async function getAllPermissions() {
  const response = await api.get('/permissions');
  return response.data;
}

// GET /api/screens  — list all screens
export async function getAllScreens() {
  const response = await api.get('/screens');
  return response.data;
}
