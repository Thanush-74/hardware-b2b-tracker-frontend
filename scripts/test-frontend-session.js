import assert from 'assert';
import {
  DEFAULT_IDLE_TIMEOUT_MS,
  DEFAULT_IDLE_WARNING_MS,
  getIdleTimeoutMs,
  getIdleWarningMs
} from '../src/config/sessionConfig.js';

console.log('====================================================');
console.log('RUNNING FRONTEND IDLE TIMEOUT CONFIGURATION TESTS');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

const test = (title, fn) => {
  try {
    fn();
    console.log(`✅ [PASS] ${title}`);
    passed++;
  } catch (err) {
    console.error(`❌ [FAIL] ${title} - ${err.message}`);
    failed++;
  }
};

// 1. Default idle timeout is exactly 5 minutes = 300,000 ms
test('Default idle timeout is exactly 5 minutes (300,000 ms)', () => {
  assert.strictEqual(DEFAULT_IDLE_TIMEOUT_MS, 5 * 60 * 1000);
  assert.strictEqual(DEFAULT_IDLE_TIMEOUT_MS, 300000);
});

// 2. Default warning threshold is exactly 30 seconds = 30,000 ms
test('Default warning threshold is exactly 30 seconds (30,000 ms)', () => {
  assert.strictEqual(DEFAULT_IDLE_WARNING_MS, 30 * 1000);
  assert.strictEqual(DEFAULT_IDLE_WARNING_MS, 30000);
});

// 3. getIdleTimeoutMs returns 300,000 ms by default
test('getIdleTimeoutMs returns DEFAULT_IDLE_TIMEOUT_MS when not overridden', () => {
  const timeout = getIdleTimeoutMs();
  assert.strictEqual(timeout, 300000);
});

// 4. getIdleWarningMs returns 30,000 ms by default
test('getIdleWarningMs returns DEFAULT_IDLE_WARNING_MS when not overridden', () => {
  const warning = getIdleWarningMs();
  assert.strictEqual(warning, 30000);
});

// 5. Dynamic override for browser tests (window.__IDLE_TIMEOUT_MS__)
test('window.__IDLE_TIMEOUT_MS__ allows short testing intervals (e.g. 30 seconds)', () => {
  global.window = { __IDLE_TIMEOUT_MS__: 30000 };
  const timeout = getIdleTimeoutMs();
  assert.strictEqual(timeout, 30000);
  delete global.window;
});

// 6. Scaled warning for short test intervals
test('getIdleWarningMs automatically scales down for short test timeouts', () => {
  global.window = { __IDLE_TIMEOUT_MS__: 30000 };
  const warning = getIdleWarningMs();
  assert.strictEqual(warning, 10000); // 30000 / 3 = 10s warning
  delete global.window;
});

console.log('\n====================================================');
console.log(`FRONTEND SESSION CONFIG TESTS SUMMARY: Passed: ${passed}, Failed: ${failed}`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
