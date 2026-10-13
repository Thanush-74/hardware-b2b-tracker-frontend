// sessionConfig.js — Session timeout & security configuration
// Production specifications:
// 1. Inactivity auto-logout: exactly 5 minutes (5 * 60 * 1000 ms = 300,000 ms)
// 2. Inactivity warning dialog: 30 seconds (30 * 1000 ms = 30,000 ms) before logout

export const DEFAULT_IDLE_TIMEOUT_MS = 5 * 60 * 1000;  // 300,000 ms
export const DEFAULT_IDLE_WARNING_MS = 30 * 1000;       // 30,000 ms

/**
 * Returns active idle timeout in milliseconds.
 * Supports environment variable VITE_IDLE_TIMEOUT_MS or window.__IDLE_TIMEOUT_MS__ for rapid testing.
 */
export function getIdleTimeoutMs() {
  if (typeof window !== 'undefined' && window.__IDLE_TIMEOUT_MS__ != null) {
    const override = Number(window.__IDLE_TIMEOUT_MS__);
    if (!isNaN(override) && override > 0) return override;
  }

  if (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_IDLE_TIMEOUT_MS) {
    const envVal = Number(import.meta.env.VITE_IDLE_TIMEOUT_MS);
    if (!isNaN(envVal) && envVal > 0) return envVal;
  }

  return DEFAULT_IDLE_TIMEOUT_MS;
}

/**
 * Returns active warning lead time in milliseconds.
 * If total idle timeout is short (<= 60s for tests), scales to 1/3 of total timeout.
 */
export function getIdleWarningMs() {
  const totalTimeout = getIdleTimeoutMs();

  // If timeout is short (e.g. <= 60 seconds during testing), scale warning proportionally
  if (totalTimeout <= 60000) {
    return Math.floor(totalTimeout / 3);
  }

  if (typeof window !== 'undefined' && window.__IDLE_WARNING_MS__ != null) {
    const override = Number(window.__IDLE_WARNING_MS__);
    if (!isNaN(override) && override > 0) return override;
  }

  if (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_IDLE_WARNING_MS) {
    const envVal = Number(import.meta.env.VITE_IDLE_WARNING_MS);
    if (!isNaN(envVal) && envVal > 0) return envVal;
  }

  return DEFAULT_IDLE_WARNING_MS;
}

/**
 * Standard user activity events that reset the idle timer.
 * Note: Only direct user interaction (mouse, keyboard, touch, scroll) counts as activity.
 * Background polling, timers, and API responses never reset this timer.
 */
export const USER_ACTIVITY_EVENTS = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'wheel',
  'pointerdown'
];
