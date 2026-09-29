import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AccessDeniedPage from '../pages/AccessDeniedPage';

/**
 * Basic authentication check
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

/**
 * Public route (redirects authenticated users away from /login)
 */
export const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * ScreenRoute ensures the user has backend permission for the specific screen slug or path
 */
export const ScreenRoute = ({ screenSlug, screenRoute, children }) => {
  const { isAuthenticated, hasScreen, hasScreenRoute } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isPermitted = screenSlug
    ? hasScreen(screenSlug)
    : screenRoute
    ? hasScreenRoute(screenRoute)
    : hasScreenRoute(location.pathname);

  if (!isPermitted) {
    return <AccessDeniedPage requestedPath={screenRoute || location.pathname} />;
  }

  return children;
};

/**
 * AdminRoute ensures the user has administrator privileges
 */
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role?.slug !== 'admin') {
    return (
      <AccessDeniedPage
        requestedPath={location.pathname}
        message="Administrator privileges are required to access this management area."
      />
    );
  }

  return children;
};
