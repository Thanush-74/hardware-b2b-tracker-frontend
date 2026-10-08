import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../services/authService';
import IdleTimeoutHandler from '../components/IdleTimeoutHandler';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  const [permissions, setPermissions] = useState(() => {
    try {
      const savedPerms = localStorage.getItem('permissions');
      return savedPerms ? JSON.parse(savedPerms) : [];
    } catch {
      return [];
    }
  });

  const [screens, setScreens] = useState(() => {
    try {
      const savedScreens = localStorage.getItem('screens');
      return savedScreens ? JSON.parse(savedScreens) : [];
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await loginApi(email, password);
      // data contains: { token, user, permissions, screens }
      const { token: receivedToken, user: receivedUser, permissions: receivedPerms, screens: receivedScreens } = data;

      setToken(receivedToken);
      setUser(receivedUser);
      setPermissions(receivedPerms || []);
      setScreens(receivedScreens || []);

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));
      localStorage.setItem('permissions', JSON.stringify(receivedPerms || []));
      localStorage.setItem('screens', JSON.stringify(receivedScreens || []));
      localStorage.setItem('b2b_tracker_last_activity', String(Date.now()));

      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback((shouldRedirect = true) => {
    setToken(null);
    setUser(null);
    setPermissions([]);
    setScreens([]);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    localStorage.removeItem('screens');
    localStorage.removeItem('b2b_tracker_last_activity');

    if (shouldRedirect && typeof window !== 'undefined' && window.location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Listen for unauthorized 401 events from Axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      logout(true);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  // Check permission strictly against backend-returned permissions list
  const hasPermission = useCallback(
    (permissionSlug) => {
      if (!permissions || permissions.length === 0) return false;
      return permissions.some((p) => p.slug === permissionSlug);
    },
    [permissions]
  );

  // Check screen strictly against backend-returned screens list (by slug)
  const hasScreen = useCallback(
    (screenSlug) => {
      if (!screens || screens.length === 0) return false;
      return screens.some((s) => s.slug === screenSlug);
    },
    [screens]
  );

  // Check screen strictly against backend-returned screens list (by route)
  const hasScreenRoute = useCallback(
    (routePath) => {
      if (!screens || screens.length === 0) return false;
      const normalizedPath = (routePath || '').replace(/\/$/, '') || '/';
      return screens.some((s) => {
        const screenRoute = (s.route || '').replace(/\/$/, '') || '/';
        return screenRoute === normalizedPath;
      });
    },
    [screens]
  );

  // Determine initial default route for the user based on permitted screens
  const getDefaultRoute = useCallback(() => {
    if (!screens || screens.length === 0) return '/login';
    // If dashboard is permitted, use dashboard; otherwise first permitted screen route
    const dashboardScreen = screens.find((s) => s.slug === 'dashboard' || s.route === '/dashboard');
    if (dashboardScreen) return dashboardScreen.route || '/dashboard';
    return screens[0]?.route || '/';
  }, [screens]);

  const value = {
    user,
    role: user?.role || null,
    token,
    permissions,
    screens,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    logout,
    hasPermission,
    hasScreen,
    hasScreenRoute,
    getDefaultRoute,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <IdleTimeoutHandler />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
