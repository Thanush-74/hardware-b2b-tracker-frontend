// ProtectedRoute.jsx — Guards routes that require authentication
// If the user is not logged in, redirect them to /login
// If they don't have a required permission, show an access denied message

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ProtectedRoute({ children, requiredPermission, adminOnly }) {
  const { isLoggedIn, hasPermission, isAdmin } = useAuth();

  // If not logged in at all, redirect to login page
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // If route is restricted to administrators only and user is not admin
  if (adminOnly && !isAdmin()) {
    return (
      <div className="access-denied">
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
        <h2>Access Denied</h2>
        <p>You do not have administrator permissions to view this page.</p>
        <p style={{ marginTop: '4px', fontSize: '0.8rem' }}>
          Contact your administrator to request access.
        </p>
      </div>
    );
  }

  // If a specific permission is required and the user doesn't have it
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="access-denied">
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
        <p style={{ marginTop: '4px', fontSize: '0.8rem' }}>
          Contact your administrator to request access.
        </p>
      </div>
    );
  }

  // User is logged in and has permission — show the page
  return children;
}

export default ProtectedRoute;
