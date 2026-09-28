import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as loginApi } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
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

      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setPermissions([]);
    setScreens([]);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    localStorage.removeItem('screens');
  }, []);

  const hasPermission = useCallback(
    (permissionSlug) => {
      if (!user) return false;
      if (user.role?.slug === 'admin') return true;
      return permissions.some((p) => p.slug === permissionSlug);
    },
    [user, permissions]
  );

  const hasScreen = useCallback(
    (screenSlug) => {
      if (!user) return false;
      if (user.role?.slug === 'admin') return true;
      return screens.some((s) => s.slug === screenSlug);
    },
    [user, screens]
  );

  const value = {
    user,
    token,
    permissions,
    screens,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    logout,
    hasPermission,
    hasScreen,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
