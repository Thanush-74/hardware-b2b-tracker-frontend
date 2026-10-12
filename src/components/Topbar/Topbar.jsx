// Topbar.jsx — Top navigation bar shown above every page
// Shows the current page title, notification bell, and user info

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUnreadCount } from '../../services/notificationService';

// Map route paths to readable page titles
const PAGE_TITLES = {
  '/dashboard':     'Dashboard',
  '/products':      'Products',
  '/cart':          'Cart',
  '/inventory':     'Inventory',
  '/manufacturing': 'Manufacturing',
  '/orders':        'Orders',
  '/production':    'Production',
  '/deliveries':    'Deliveries',
  '/returns':       'Returns & Replacement',
  '/staff':         'Staff Management',
  '/roles':         'Roles & Permissions',
  '/expenses':      'Expenses & Financials',
  '/inspections':   'Quality Inspection',
  '/notifications': 'Notifications',
  '/search':        'Search',
};

function Topbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Get the page title for the current route
  const pageTitle = PAGE_TITLES[location.pathname] || 'TitanCore';

  // Fetch unread notification count on mount
  useEffect(() => {
    async function fetchCount() {
      try {
        const result = await getUnreadCount();
        // The backend returns { success, message, data: { count } } or similar
        setUnreadCount(result.data?.count || result.data || 0);
      } catch {
        // Silently fail — notifications are not critical
        setUnreadCount(0);
      }
    }
    fetchCount();
  }, [location.pathname]); // re-fetch when page changes

  function handleLogout() {
    logout();
    navigate('/login');
  }

  // Get the first letter of the user's name for the avatar circle
  const avatarLetter = user ? user.first_name?.[0]?.toUpperCase() || 'U' : 'U';

  return (
    <header className="topbar">
      {/* Current page name */}
      <div className="topbar-title">{pageTitle}</div>

      <div className="topbar-right">
        {/* Notification Bell */}
        <button
          className="topbar-notification-btn"
          onClick={() => navigate('/notifications')}
          title="Notifications"
        >
          🔔
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User info + logout */}
        {user && (
          <>
            <div className="topbar-avatar">{avatarLetter}</div>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
              {user.first_name} {user.last_name}
            </span>
          </>
        )}
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Topbar;
