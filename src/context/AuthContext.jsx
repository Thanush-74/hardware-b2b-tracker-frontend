// AuthContext.jsx — Provides logged-in user info, session idle timeout, and security management
// Any component can call useAuth() to get the current user, permissions, etc.

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getIdleTimeoutMs,
  getIdleWarningMs,
  USER_ACTIVITY_EVENTS
} from '../config/sessionConfig';
import { registerUnauthorizedHandler } from '../services/api';

// Create the context object
const AuthContext = createContext(null);

/**
 * Helper to check if a JWT token has expired on the client side
 */
function isTokenExpired(tokenStr) {
  if (!tokenStr) return true;
  try {
    const parts = tokenStr.split('.');
    if (parts.length !== 3) return false;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    if (parsed.exp && Date.now() >= parsed.exp * 1000) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Modal dialog presented when user has been idle and is about to be logged out
 */
function IdleWarningModal({ secondsRemaining, onStayLoggedIn, onLogout }) {
  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        backgroundColor: 'rgba(26, 26, 46, 0.82)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="idle-warning-title"
    >
      <div
        className="modal"
        style={{
          backgroundColor: '#ffffff',
          color: '#1a1a2e',
          maxWidth: '460px',
          width: '100%',
          textAlign: 'center',
          padding: '36px 28px',
          borderRadius: '14px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
          position: 'relative',
          zIndex: 1000000,
          border: '1px solid #dde3ec'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: '3.2rem', marginBottom: '16px', lineHeight: 1 }}>⏳</div>
        <h2
          id="idle-warning-title"
          className="modal-title"
          style={{ justifyContent: 'center', fontSize: '1.35rem', marginBottom: '14px', color: '#1a1a2e', fontWeight: 700 }}
        >
          Session Inactivity Warning
        </h2>
        <p style={{ color: '#4b5563', fontSize: '1rem', marginBottom: '28px', lineHeight: 1.6 }}>
          You have been inactive. You will be logged out in{' '}
          <strong style={{ color: '#dc2626', fontSize: '1.2rem', fontWeight: 700 }}>
            {secondsRemaining} second{secondsRemaining !== 1 ? 's' : ''}
          </strong>{' '}
          due to inactivity.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{
              backgroundColor: '#1565c0',
              color: '#ffffff',
              minWidth: '160px',
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={onStayLoggedIn}
            autoFocus
          >
            Continue Session
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              backgroundColor: '#1a1a2e',
              color: '#ffffff',
              minWidth: '130px',
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={onLogout}
          >
            Log Out Now
          </button>
        </div>
      </div>
    </div>
  );
}

// AuthProvider wraps the whole app so all components can access auth state & idle protection
export function AuthProvider({ children }) {
  let navigate;
  try {
    navigate = useNavigate();
  } catch {
    navigate = (path) => {
      if (typeof window !== 'undefined') window.location.href = path;
    };
  }

  // Load saved session from localStorage so user stays logged in across refreshes
  // If stored token is already expired (> 1 day old), discard it immediately
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken && isTokenExpired(savedToken)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('permissions');
      localStorage.removeItem('screens');
      localStorage.removeItem('auth:last_activity');
      return null;
    }
    return savedToken || null;
  });

  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) return null;
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [permissions, setPermissions] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) return [];
    const saved = localStorage.getItem('permissions');
    return saved ? JSON.parse(saved) : [];
  });

  const [screens, setScreens] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) return [];
    const saved = localStorage.getItem('screens');
    return saved ? JSON.parse(saved) : [];
  });

  // Idle warning state
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const [warningSecondsLeft, setWarningSecondsLeft] = useState(30);

  // Timer and activity tracking refs
  const warningTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const lastActivityTimeRef = useRef(Date.now());
  const tokenRef = useRef(token);
  const isWarningActiveRef = useRef(false);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  // Safe navigation helper
  const redirectToLogin = useCallback(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/login') {
      return;
    }
    if (navigate) {
      navigate('/login', { replace: true });
    } else if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, [navigate]);

  // Clear all running timeouts and intervals
  const clearIdleTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  // Called when user logs out — clears everything from state & localStorage
  const logout = useCallback(() => {
    isWarningActiveRef.current = false;
    clearIdleTimers();
    setShowIdleWarning(false);

    setToken(null);
    setUser(null);
    setPermissions([]);
    setScreens([]);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    localStorage.removeItem('screens');
    localStorage.removeItem('auth:last_activity');
  }, [clearIdleTimers]);

  // Handle automatic logout due to 5-minute inactivity
  const handleIdleAutoLogout = useCallback(() => {
    isWarningActiveRef.current = false;
    console.warn('[Session Security] 5-minute inactivity timeout reached. Automatically logging out...');
    logout();
    redirectToLogin();
  }, [logout, redirectToLogin]);

  // Reset the idle timer and reschedule warning & auto-logout
  const resetIdleTimer = useCallback((syncStorage = true) => {
    if (!tokenRef.current) return;

    isWarningActiveRef.current = false;
    clearIdleTimers();
    setShowIdleWarning(false);

    const now = Date.now();
    lastActivityTimeRef.current = now;

    if (syncStorage) {
      try {
        localStorage.setItem('auth:last_activity', String(now));
      } catch {
        // Ignore localStorage quota errors
      }
    }

    const timeoutMs = getIdleTimeoutMs();
    const warningLeadMs = getIdleWarningMs();
    const warningDelayMs = Math.max(0, timeoutMs - warningLeadMs);

    console.log(
      `⏱️ [Session Security] Inactivity timer active: Auto-logout in ${timeoutMs / 1000}s (Warning in ${warningDelayMs / 1000}s)`
    );

    // 1. Warning timer (fires 30s before auto-logout at 4m 30s = 270,000 ms)
    warningTimerRef.current = setTimeout(() => {
      if (!tokenRef.current) return;
      isWarningActiveRef.current = true;
      console.warn(`⚠️ [Session Security] Inactivity warning triggered (${warningLeadMs / 1000}s remaining)`);
      setShowIdleWarning(true);

      let remaining = Math.ceil(warningLeadMs / 1000);
      setWarningSecondsLeft(remaining);

      countdownIntervalRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
        } else {
          setWarningSecondsLeft(remaining);
        }
      }, 1000);
    }, warningDelayMs);

    // 2. Logout timer (fires at exactly 5 minutes = 300,000 ms)
    logoutTimerRef.current = setTimeout(() => {
      if (!tokenRef.current) return;
      handleIdleAutoLogout();
    }, timeoutMs);
  }, [clearIdleTimers, handleIdleAutoLogout]);

  // Throttled activity listener (mouse movement, clicks, keystrokes, scroll, touch)
  // Background polling or API requests do NOT trigger this handler
  const handleUserActivity = useCallback(() => {
    if (!tokenRef.current) return;

    // While warning modal is shown, do NOT dismiss or reset on mouse movement or typing.
    // The user must explicitly click "Continue Session".
    if (isWarningActiveRef.current) {
      return;
    }

    const now = Date.now();
    // Throttle: reset timers at most once per 1000ms during high-frequency events like mousemove
    if (now - lastActivityTimeRef.current < 1000) {
      return;
    }

    resetIdleTimer(true);
  }, [resetIdleTimer]);

  // Called after a successful login — saves everything to state and localStorage
  const login = useCallback((data) => {
    const { token: newToken, user: newUser, permissions: newPermissions, screens: newScreens } = data;
    setToken(newToken);
    setUser(newUser);
    setPermissions(newPermissions);
    setScreens(newScreens);

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('permissions', JSON.stringify(newPermissions));
    localStorage.setItem('screens', JSON.stringify(newScreens));
    localStorage.setItem('auth:last_activity', String(Date.now()));

    lastActivityTimeRef.current = Date.now();
  }, []);

  // Setup idle timer and activity event listeners when authenticated
  useEffect(() => {
    if (!token) {
      clearIdleTimers();
      setShowIdleWarning(false);
      return;
    }

    // Start idle timer immediately on authenticated session
    resetIdleTimer();

    // Attach listeners for user interaction
    USER_ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleUserActivity, { passive: true });
    });

    return () => {
      clearIdleTimers();
      USER_ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleUserActivity);
      });
    };
  }, [token, handleUserActivity, resetIdleTimer, clearIdleTimers]);

  // Synchronize logout and user activity across multiple browser tabs
  useEffect(() => {
    function handleStorageChange(e) {
      // 1. If another tab logged out (token was removed)
      if (e.key === 'token' && !e.newValue) {
        console.log('[Session Security] User logged out in another tab. Synchronizing logout...');
        logout();
        redirectToLogin();
      }

      // 2. If another tab recorded user activity, keep this tab in sync
      if (e.key === 'auth:last_activity' && e.newValue) {
        const remoteTime = Number(e.newValue);
        if (!isNaN(remoteTime) && remoteTime > lastActivityTimeRef.current) {
          lastActivityTimeRef.current = remoteTime;
          resetIdleTimer(false);
        }
      }
    }

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [logout, redirectToLogin, resetIdleTimer]);

  // Handle tab switching and browser minimize:
  // When tab becomes visible again, verify if 5 minutes elapsed during backgrounding
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible' && tokenRef.current) {
        const now = Date.now();
        const storedActivity = Number(localStorage.getItem('auth:last_activity')) || lastActivityTimeRef.current;
        const latestActivity = Math.max(lastActivityTimeRef.current, storedActivity);
        const elapsed = now - latestActivity;
        const timeoutMs = getIdleTimeoutMs();

        if (elapsed >= timeoutMs) {
          console.warn(`[Session Security] Inactive for ${Math.round(elapsed / 1000)}s while backgrounded. Logging out...`);
          handleIdleAutoLogout();
        } else {
          // If still within active window, refresh timer
          resetIdleTimer(false);
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleIdleAutoLogout, resetIdleTimer]);

  // Expose reactive window.__IDLE_TIMEOUT_MS__ and window testing helpers
  useEffect(() => {
    let customTimeout = window.__IDLE_TIMEOUT_MS__ || null;

    try {
      Object.defineProperty(window, '__IDLE_TIMEOUT_MS__', {
        get() {
          return customTimeout;
        },
        set(val) {
          customTimeout = Number(val);
          console.log(`⏱️ [Session Security] Idle timeout set to ${customTimeout} ms (${customTimeout / 1000}s). Restarting timer now...`);
          resetIdleTimer();
        },
        configurable: true
      });

      window.setIdleTimeout = (seconds) => {
        window.__IDLE_TIMEOUT_MS__ = Number(seconds) * 1000;
        return `Idle timeout updated to ${seconds} seconds. Countdown started!`;
      };
      window.resetIdleTimer = resetIdleTimer;

      // Instantly trigger the inactivity warning popup to test UI, countdown, and Continue Session button
      window.testIdleWarning = (seconds = 30) => {
        clearIdleTimers();
        isWarningActiveRef.current = true;
        setShowIdleWarning(true);
        let rem = Number(seconds);
        setWarningSecondsLeft(rem);
        countdownIntervalRef.current = setInterval(() => {
          rem -= 1;
          if (rem <= 0) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
            isWarningActiveRef.current = false;
            handleIdleAutoLogout();
          } else {
            setWarningSecondsLeft(rem);
          }
        }, 1000);
        return `⚠️ Inactivity Warning popup shown with ${seconds}s countdown! (Mouse movement will NOT dismiss it)`;
      };
    } catch {
      // Ignore if Object.defineProperty is not allowed
    }

    return () => {
      delete window.setIdleTimeout;
      delete window.resetIdleTimer;
      delete window.testIdleWarning;
    };
  }, [resetIdleTimer, clearIdleTimers, handleIdleAutoLogout]);

  // Register Axios 401 response handler to clear AuthContext and redirect to /login
  useEffect(() => {
    const unregister = registerUnauthorizedHandler(() => {
      logout();
      redirectToLogin();
    });

    return unregister;
  }, [logout, redirectToLogin]);

  // Check if the logged-in user has a specific permission slug (e.g. "products.view")
  const hasPermission = useCallback((slug) => {
    return permissions.some((p) => p.slug === slug);
  }, [permissions]);

  // Check if the logged-in user is an admin
  const isAdmin = useCallback(() => {
    return user && user.role && user.role.slug === 'admin';
  }, [user]);

  // The value object is what all components get when they call useAuth()
  const value = {
    token,
    user,
    permissions,
    screens,
    isLoggedIn: !!token,
    login,
    logout,
    resetIdleTimer,
    hasPermission,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showIdleWarning && (
        <IdleWarningModal
          secondsRemaining={warningSecondsLeft}
          onStayLoggedIn={() => resetIdleTimer(true)}
          onLogout={() => {
            logout();
            redirectToLogin();
          }}
        />
      )}
    </AuthContext.Provider>
  );
}

// Custom hook — makes it easy to use auth in any component: const { user } = useAuth()
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}
