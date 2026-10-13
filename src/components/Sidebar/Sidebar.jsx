// Sidebar.jsx — The left navigation sidebar
// Reorganized with expandable parent menus and dynamic role-based access

import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  EXPANDED_STORAGE_KEY,
  NAV_STRUCTURE,
  isPathActive,
  isItemAuthorized,
  getInitialExpandedState,
} from './sidebarConfig';

/**
 * Chevron icon that smoothly rotates when expandable parent is opened
 */
function ChevronIcon({ isOpen }) {
  return (
    <span className={`nav-chevron ${isOpen ? 'open' : ''}`} aria-hidden="true">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </span>
  );
}

function Sidebar() {
  const authContext = useAuth();
  const { user, logout } = authContext;
  const location = useLocation();
  const navigate = useNavigate();

  const [expandedParents, setExpandedParents] = useState(() =>
    getInitialExpandedState(location.pathname)
  );

  // Automatically expand parent whenever location.pathname matches any of its children
  useEffect(() => {
    let changed = false;
    const updated = { ...expandedParents };

    NAV_STRUCTURE.forEach((entry) => {
      if (entry.type === 'parent' && Array.isArray(entry.children)) {
        const activeChild = entry.children.some((c) => isPathActive(c.path, location.pathname));
        if (activeChild && !updated[entry.id]) {
          updated[entry.id] = true;
          changed = true;
        }
      }
    });

    if (changed) {
      setExpandedParents(updated);
      try {
        sessionStorage.setItem(EXPANDED_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage quota errors
      }
    }
  }, [location.pathname]);

  function toggleParent(parentId) {
    setExpandedParents((prev) => {
      const nextState = { ...prev, [parentId]: !prev[parentId] };
      try {
        sessionStorage.setItem(EXPANDED_STORAGE_KEY, JSON.stringify(nextState));
      } catch {
        // Ignore storage quota errors
      }
      return nextState;
    });
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  // Build the authorized navigation menu dynamically:
  // - Main level items only show if authorized
  // - Parent menus only show if at least ONE of their children is authorized
  const visibleNav = NAV_STRUCTURE.map((entry) => {
    if (entry.type === 'item') {
      const allowed = isItemAuthorized(entry, authContext);
      return allowed ? entry : null;
    }

    if (entry.type === 'parent') {
      const authorizedChildren = entry.children.filter((child) =>
        isItemAuthorized(child, authContext)
      );

      // Hide parent if user cannot access any of its children
      if (authorizedChildren.length === 0) {
        return null;
      }

      return {
        ...entry,
        children: authorizedChildren,
      };
    }

    return null;
  }).filter(Boolean);

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
      <nav className="sidebar-nav" aria-label="Main Navigation">
        <div className="sidebar-section-title">Navigation</div>

        {visibleNav.map((entry) => {
          if (entry.type === 'item') {
            const active = isPathActive(entry.path, location.pathname);
            return (
              <NavLink
                key={entry.id}
                to={entry.path}
                className={({ isActive }) =>
                  'sidebar-nav-item' + (isActive || active ? ' active' : '')
                }
              >
                <span className="nav-icon">{entry.icon}</span>
                <span className="nav-label">{entry.label}</span>
              </NavLink>
            );
          }

          if (entry.type === 'parent') {
            const isExpanded = !!expandedParents[entry.id];
            const hasActiveChild = entry.children.some((c) =>
              isPathActive(c.path, location.pathname)
            );

            return (
              <div key={entry.id} className="sidebar-parent-group">
                <button
                  type="button"
                  className={`sidebar-parent-btn ${hasActiveChild ? 'has-active-child' : ''}`}
                  onClick={() => toggleParent(entry.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`submenu-${entry.id}`}
                >
                  <span className="nav-icon">{entry.icon}</span>
                  <span className="nav-label">{entry.label}</span>
                  <ChevronIcon isOpen={isExpanded} />
                </button>

                {isExpanded && (
                  <div
                    id={`submenu-${entry.id}`}
                    className="sidebar-submenu"
                    role="region"
                    aria-label={entry.label}
                  >
                    {entry.children.map((child) => {
                      const childActive = isPathActive(child.path, location.pathname);
                      return (
                        <NavLink
                          key={child.id}
                          to={child.path}
                          className={({ isActive }) =>
                            'sidebar-subnav-item' +
                            (isActive || childActive ? ' active' : '')
                          }
                        >
                          <span className="nav-icon">{child.icon}</span>
                          <span className="nav-label">{child.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
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
          type="button"
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
