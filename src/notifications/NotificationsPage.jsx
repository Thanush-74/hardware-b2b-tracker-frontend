// NotificationsPage.jsx — View and manage notifications for the logged-in user
// GET /api/notifications, PATCH /api/notifications/:id/read, PATCH /api/notifications/read-all

import { useState, useEffect } from 'react';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../services/notificationService';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    setError('');
    try {
      const result = await getNotifications();
      const list = result.data?.notifications || result.data || [];
      setNotifications(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(notification) {
    if (notification.is_read) return; // already read, nothing to do
    try {
      await markAsRead(notification.id);
      // Update it locally so the UI reflects immediately without a full reload
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      );
    } catch {
      // Silent fail — not critical
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setSuccessMessage('All notifications marked as read.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark all as read.');
    }
  }

  // Show a relative time string like "5m ago" or "2h ago"
  function timeAgo(dateString) {
    if (!dateString) return '';
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🔔 Notifications</h1>
          <div className="page-header-sub">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </div>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-outline" onClick={handleMarkAllAsRead}>
            ✔ Mark All as Read
          </button>
        )}
      </div>

      {successMessage && <div className="alert alert-success">✔ {successMessage}</div>}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {loading ? (
        <div className="spinner-wrapper"><div className="spinner" /> Loading notifications…</div>
      ) : notifications.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <p>No notifications yet.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item${!notification.is_read ? ' unread' : ''}`}
              onClick={() => handleMarkAsRead(notification)}
              style={{ cursor: notification.is_read ? 'default' : 'pointer' }}
              title={notification.is_read ? '' : 'Click to mark as read'}
            >
              {/* Blue dot for unread */}
              {!notification.is_read && <div className="notification-dot" />}

              <div className="notification-content" style={{ flex: 1 }}>
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
                  <div className="notification-time">{timeAgo(notification.created_at)}</div>
                  {notification.type && notification.type !== 'system' && (
                    <span style={{ fontSize: '0.7rem', color: '#1565c0', background: '#e3f0ff', padding: '1px 6px', borderRadius: '10px' }}>
                      {notification.type}
                    </span>
                  )}
                  {notification.is_read && (
                    <span style={{ fontSize: '0.7rem', color: '#9e9e9e' }}>✔ Read</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
