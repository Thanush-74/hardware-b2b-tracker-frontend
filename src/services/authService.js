// authService.js — All API calls related to authentication
import api from './api';

// POST /api/auth/login
// Sends email + password, gets back token, user, permissions, screens
export async function loginUser(email, password) {
  const response = await api.post('/auth/login', { email, password });
  return response.data; // { success, message, data: { token, user, permissions, screens } }
}
