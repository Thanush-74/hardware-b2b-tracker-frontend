import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getIdleTimeoutMs, getIdleWarningMs } from '../config/sessionConfig';
import IdleTimeoutModal from './IdleTimeoutModal';

/**
 * Supported user activity events that reset the idle timer
 */
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

/**
 * IdleTimeoutHandler
 * Manages client-side idle tracking, activity listeners, warning modal, and automatic logout.
 * Starts only when authenticated and cleans up all listeners and timers on logout or unmount.
 */
const IdleTimeoutHandler = () => {
  const { isAuthenticated, logout } = useAuth();

  const [warningOpen, setWarningOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  const lastActivityRef = useRef(Date.now());
  const lastMouseMoveRef = useRef(0);
  const warningTimeoutRef = useRef(null);
  const logoutTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const warningOpenRef = useRef(false);

  // Sync ref with state
  warningOpenRef.current = warningOpen;

  // Clears all active timeouts and countdown intervals
  const clearAllTimers = useCallback(() => {
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
      logoutTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  // Executes automatic logout and redirection to /login
  const handleIdleLogout = useCallback(() => {
    clearAllTimers();
    setWarningOpen(false);
    logout(true);
  }, [clearAllTimers, logout]);

  // Schedules the warning and logout timers based on remaining time
  const scheduleTimers = useCallback(() => {
    clearAllTimers();

    const idleTimeout = getIdleTimeoutMs();
    const warningDuration = getIdleWarningMs();
    const warningDelay = Math.max(0, idleTimeout - warningDuration);

    const now = Date.now();
    const elapsed = now - lastActivityRef.current;
    const remainingToLogout = idleTimeout - elapsed;
    const remainingToWarning = warningDelay - elapsed;

    if (remainingToLogout <= 0) {
      handleIdleLogout();
      return;
    }

    if (remainingToWarning <= 0) {
      // User is already in the warning window
      setWarningOpen(true);
      setSecondsRemaining(Math.max(1, Math.ceil(remainingToLogout / 1000)));

      countdownIntervalRef.current = setInterval(() => {
        const currentRemaining = Math.max(0, Math.ceil((lastActivityRef.current + idleTimeout - Date.now()) / 1000));
        setSecondsRemaining(currentRemaining);
        if (currentRemaining <= 0) {
          handleIdleLogout();
        }
      }, 1000);
    } else {
      // Schedule future warning
      warningTimeoutRef.current = setTimeout(() => {
        setWarningOpen(true);
        const initialSeconds = Math.max(1, Math.ceil(warningDuration / 1000));
        setSecondsRemaining(initialSeconds);

        countdownIntervalRef.current = setInterval(() => {
          const currentRemaining = Math.max(0, Math.ceil((lastActivityRef.current + idleTimeout - Date.now()) / 1000));
          setSecondsRemaining(currentRemaining);
          if (currentRemaining <= 0) {
            handleIdleLogout();
          }
        }, 1000);
      }, remainingToWarning);
    }

    // Schedule ultimate logout timer
    logoutTimeoutRef.current = setTimeout(() => {
      handleIdleLogout();
    }, remainingToLogout);
  }, [clearAllTimers, handleIdleLogout]);

  // Resets activity timestamp and restarts timers
  const resetIdleTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    try {
      localStorage.setItem('b2b_tracker_last_activity', String(Date.now()));
    } catch {
      // Ignore localStorage errors
    }

    if (warningOpenRef.current) {
      setWarningOpen(false);
    }
    scheduleTimers();
  }, [scheduleTimers]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearAllTimers();
      setWarningOpen(false);
      return;
    }

    // Initialize timestamps and timers
    lastActivityRef.current = Date.now();
    scheduleTimers();

    // Activity event handler with throttling for high-frequency events (mousemove)
    const handleActivity = (e) => {
      if (e && e.type === 'mousemove') {
        const now = Date.now();
        // Throttle mousemove to fire at most once every 1.5 seconds
        if (now - lastMouseMoveRef.current < 1500) {
          return;
        }
        lastMouseMoveRef.current = now;
      }
      resetIdleTimer();
    };

    // Sync across multiple browser tabs
    const handleStorageEvent = (e) => {
      if (e.key === 'b2b_tracker_last_activity' && e.newValue) {
        lastActivityRef.current = Number(e.newValue);
        if (warningOpenRef.current) {
          setWarningOpen(false);
        }
        scheduleTimers();
      }
      if (e.key === 'token' && !e.newValue) {
        // Logged out in another tab
        handleIdleLogout();
      }
    };

    // Recheck timers on tab focus or visibility change to counter background throttling
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const idleTimeout = getIdleTimeoutMs();
        const elapsed = Date.now() - lastActivityRef.current;
        if (elapsed >= idleTimeout) {
          handleIdleLogout();
        } else {
          scheduleTimers();
        }
      }
    };

    // Attach listeners
    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });
    window.addEventListener('storage', handleStorageEvent);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    // Cleanup when user logs out or component unmounts
    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      window.removeEventListener('storage', handleStorageEvent);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      clearAllTimers();
    };
  }, [isAuthenticated, clearAllTimers, handleIdleLogout, resetIdleTimer, scheduleTimers]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <IdleTimeoutModal
      open={warningOpen}
      secondsRemaining={secondsRemaining}
      onStayLoggedIn={resetIdleTimer}
      onLogout={handleIdleLogout}
    />
  );
};

export default IdleTimeoutHandler;
