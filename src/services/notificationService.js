// notificationService.js — All API calls for Notifications
import api from './api';

// GET /api/notifications  — get all notifications for the logged-in user
export async function getNotifications(params = {}) {
  const response = await api.get('/notifications', { params });
  return response.data;
}

// GET /api/notifications/unread-count  — get count of unread notifications
export async function getUnreadCount() {
  const response = await api.get('/notifications/unread-count');
  return response.data;
}

// PATCH /api/notifications/read-all  — mark all notifications as read
export async function markAllAsRead() {
  const response = await api.patch('/notifications/read-all');
  return response.data;
}

// PATCH /api/notifications/:id/read  — mark a single notification as read
export async function markAsRead(id) {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
}
