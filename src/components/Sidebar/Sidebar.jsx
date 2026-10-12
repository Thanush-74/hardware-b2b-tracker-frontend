// Sidebar.jsx — The left navigation sidebar
// Reads the user's permitted screens from auth context to build the nav menu dynamically

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Map each screen slug to a route path, display name, and emoji icon
const SCREEN_MAP = {
  dashboard:      { path: '/dashboard',      label: 'Dashboard',           icon: '🏠' },
  products:       { path: '/products',       label: 'Products',            icon: '📦' },
  cart:           { path: '/cart',           label: 'Cart',                icon: '🛒' },
  inventory:      { path: '/inventory',      label: 'Inventory',           icon: '🗃️' },
  manufacturing:  { path: '/manufacturing',  label: 'Manufacturing',       icon: '🔧' },
  orders:         { path: '/orders',         label: 'Orders',              icon: '📋' },
  production:     { path: '/production',     label: 'Production',          icon: '⚙️' },
  deliveries:     { path: '/deliveries',     label: 'Deliveries',          icon: '🚚' },
  returns:        { path: '/returns',        label: 'Returns',             icon: '↩️' },
  staff:          { path: '/staff',          label: 'Staff Management',    icon: '👥' },
  roles:          { path: '/roles',          label: 'Roles & Permissions', icon: '🔐' },
  revenue:        { path: '/revenue',        label: 'Revenue',             icon: '📈' },
  expenses:       { path: '/expenses',       label: 'Expenses',            icon: '💰' },
  inspections:    { path: '/inspections',    label: 'Quality Inspection',  icon: '🔍' },
  inspection:     { path: '/inspections',    label: 'Quality Inspection',  icon: '🔍' },
  notifications:  { path: '/notifications',  label: 'Notifications',       icon: '🔔' },
  search:         { path: '/search',         label: 'Search',              icon: '🔎' },
};

function Sidebar() {
  const { user, screens, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  // Build the nav items from the screens the user is allowed to access
  const mappedItems = [];
  screens.forEach((screen) => {
    if (screen?.slug === 'expenses') {
      // The expenses screen permission covers both company Revenue and Operating Expenses
      mappedItems.push({ path: '/revenue', label: 'Revenue', icon: '📈' });
      mappedItems.push({ path: '/expenses', label: 'Expenses', icon: '💰' });
    } else if (SCREEN_MAP[screen?.slug]) {
      mappedItems.push(SCREEN_MAP[screen?.slug]);
    }
  });

  // Administrators can manage Roles & Permissions
  if (isAdmin() && SCREEN_MAP.roles) {
    mappedItems.push(SCREEN_MAP.roles);
  }

  // Ensure Dashboard is always the first item in navigation
  const otherItems = mappedItems.filter((item) => item.path !== SCREEN_MAP.dashboard.path);

  // Deduplicate items by path
  const seenPaths = new Set();
  const uniqueOtherItems = otherItems.filter((item) => {
    if (seenPaths.has(item.path)) return false;
    seenPaths.add(item.path);
    return true;
  });

  // Always put Dashboard first in the navigation
  const displayItems = [SCREEN_MAP.dashboard, ...uniqueOtherItems];

  return (
    <aside className="sidebar">
      {/* Logo / Brand */}
      <div className="sidebar-logo">
        <h2>Titan<span>Core</span></h2>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', marginTop: '2px' }}>
          Hardware B2B Tracker
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Navigation</div>
        {displayItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              'sidebar-nav-item' + (isActive ? ' active' : '')
            }
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Current user info at the bottom */}
      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user">
            <strong>{user.first_name} {user.last_name}</strong>
            {user.role && <div>{user.role.name}</div>}
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            marginTop: '10px',
            width: '100%',
            padding: '7px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '6px',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontFamily: 'inherit',
          }}
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
