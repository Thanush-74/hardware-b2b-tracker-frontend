// AuthContext.jsx — Provides logged-in user info to all components
// Any component can call useAuth() to get the current user, permissions, etc.

import { createContext, useContext, useState } from 'react';

// Create the context object
const AuthContext = createContext(null);

// AuthProvider wraps the whole app (in main.jsx) so all components can access auth state
export function AuthProvider({ children }) {
  // Load saved session from localStorage so the user stays logged in on page refresh
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [permissions, setPermissions] = useState(() => {
    const saved = localStorage.getItem('permissions');
    return saved ? JSON.parse(saved) : [];
  });
  const [screens, setScreens] = useState(() => {
    const saved = localStorage.getItem('screens');
    return saved ? JSON.parse(saved) : [];
  });

  // Called after a successful login — saves everything to state and localStorage
  function login(data) {
    const { token, user, permissions, screens } = data;
    setToken(token);
    setUser(user);
    setPermissions(permissions);
    setScreens(screens);

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('permissions', JSON.stringify(permissions));
    localStorage.setItem('screens', JSON.stringify(screens));
  }

  // Called when user logs out — clears everything
  function logout() {
    setToken(null);
    setUser(null);
    setPermissions([]);
    setScreens([]);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    localStorage.removeItem('screens');
  }

  // Check if the logged-in user has a specific permission slug (e.g. "products.view")
  function hasPermission(slug) {
    return permissions.some((p) => p.slug === slug);
  }

  // Check if the logged-in user is an admin
  // Admin role slug is 'admin' based on the backend seeder convention
  function isAdmin() {
    return user && user.role && user.role.slug === 'admin';
  }

  // The value object is what all components get when they call useAuth()
  const value = {
    token,
    user,
    permissions,
    screens,
    isLoggedIn: !!token,
    login,
    logout,
    hasPermission,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook — makes it easy to use auth in any component: const { user } = useAuth()
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}
