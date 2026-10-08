/**
 * Client-Side Session Security Configuration
 * 
 * 1. Idle Timeout:
 *    - Default: Exactly 15 minutes = 15 * 60 * 1000 ms (900,000 ms).
 *    - Configurable via VITE_IDLE_TIMEOUT_MS in .env or window.__IDLE_TIMEOUT_MS__ in browser tests.
 * 
 * 2. Idle Warning Duration:
 *    - Default: Exactly 1 minute = 60 * 1000 ms (60,000 ms) before logout.
 *    - Shows a non-intrusive warning modal: "You have been inactive. You will be logged out in 1 minute."
 *    - Configurable via VITE_IDLE_WARNING_MS or window.__IDLE_WARNING_MS__.
 */

export const DEFAULT_IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes (900,000 ms)
export const DEFAULT_IDLE_WARNING_MS = 60 * 1000;      // 1 minute (60,000 ms)

/**
 * Returns the effective idle timeout in milliseconds
 */
export const getIdleTimeoutMs = () => {
  if (typeof window !== 'undefined' && typeof window.__IDLE_TIMEOUT_MS__ === 'number' && window.__IDLE_TIMEOUT_MS__ > 0) {
    return window.__IDLE_TIMEOUT_MS__;
  }
  const envSource = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : (typeof process !== 'undefined' && process.env ? process.env : {});
  const envVal = Number(envSource.VITE_IDLE_TIMEOUT_MS);
  if (!isNaN(envVal) && envVal > 0) {
    return envVal;
  }
  return DEFAULT_IDLE_TIMEOUT_MS;
};

/**
 * Returns the warning threshold duration before automatic logout
 */
export const getIdleWarningMs = () => {
  if (typeof window !== 'undefined' && typeof window.__IDLE_WARNING_MS__ === 'number' && window.__IDLE_WARNING_MS__ > 0) {
    return window.__IDLE_WARNING_MS__;
  }
  const envSource = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : (typeof process !== 'undefined' && process.env ? process.env : {});
  const envVal = Number(envSource.VITE_IDLE_WARNING_MS);
  if (!isNaN(envVal) && envVal > 0) {
    return envVal;
  }
  const currentTimeout = getIdleTimeoutMs();
  // If the timeout is configured short for testing (e.g. 30s), scale the warning window
  if (currentTimeout <= 60 * 1000) {
    return Math.max(5 * 1000, Math.floor(currentTimeout / 3));
  }
  return DEFAULT_IDLE_WARNING_MS;
};
