/**
 * LU 51.1 — JWT Verification Depth Tests (Solution)
 *
 * Covers all four failure modes:
 *   1. Missing Authorization header
 *   2. Expired token
 *   3. Invalid signature (signed with wrong key)
 *   4. Wrong audience / missing audience
 */

require('dotenv').config();
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'lu51-depth-test-secret-do-not-use-in-production-32chars';

const http = require('http');
const {
  signToken,
  signExpiredToken,
  signWithWrongSecret,
  signTokenWrongAudience,
  signTokenNoAudience,
} = require('../src/utils/jwt');

const originalLog = console.log;
console.log = () => {};
const app = require('../src/app');
console.log = originalLog;

const server = http.createServer(app);

function request(options) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const req = http.request(
      { hostname: '127.0.0.1', port: addr.port, ...options },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode, body: data }); }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) { console.log(`  ✓ ${message}`); passed++; }
  else           { console.log(`  ✗ ${message}`); failed++; }
}

async function runTests() {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  console.log('\nLU 51.1 — JWT Verification Depth Tests\n');

  // ── Test 1: Missing Authorization header ──────────────────────────────────
  console.log('Test 1: Missing Authorization header');
  {
    const res = await request({ path: '/profile' });
    assert(res.status === 401, `Status 401 (got ${res.status})`);
    assert(res.body?.error?.code === 'AUTH_REQUIRED', `Code AUTH_REQUIRED (got ${res.body?.error?.code})`);
  }

  // ── Test 1b: Wrong scheme ──────────────────────────────────────────────────
  console.log('\nTest 1b: Wrong scheme (Basic)');
  {
    const res = await request({ path: '/profile', headers: { Authorization: 'Basic dXNlcjpwYXNz' } });
    assert(res.status === 401, `Status 401 (got ${res.status})`);
    assert(res.body?.error?.code === 'AUTH_REQUIRED', `Code AUTH_REQUIRED (got ${res.body?.error?.code})`);
  }

  // ── Test 2: Expired token ─────────────────────────────────────────────────
  console.log('\nTest 2: Expired token (TokenExpiredError)');
  {
    const expiredToken = signExpiredToken({ sub: 'user-7' });
    await new Promise((r) => setTimeout(r, 100)); // ensure past expiry
    const res = await request({
      path: '/profile',
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert(res.status === 401, `Status 401 (got ${res.status})`);
    assert(res.body?.error?.code === 'AUTH_REQUIRED', `Generic AUTH_REQUIRED — not "Token expired" (got ${res.body?.error?.code})`);
  }

  // ── Test 3: Invalid signature ─────────────────────────────────────────────
  console.log('\nTest 3: Invalid signature (signed with wrong secret)');
  {
    const badToken = signWithWrongSecret({ sub: 'user-7' });
    const res = await request({
      path: '/profile',
      headers: { Authorization: `Bearer ${badToken}` },
    });
    assert(res.status === 401, `Status 401 (got ${res.status})`);
    assert(res.body?.error?.code === 'AUTH_REQUIRED', `Code AUTH_REQUIRED (got ${res.body?.error?.code})`);
  }

  // ── Test 3b: Malformed token ──────────────────────────────────────────────
  console.log('\nTest 3b: Malformed token string');
  {
    const res = await request({
      path: '/profile',
      headers: { Authorization: 'Bearer not.a.real.jwt' },
    });
    assert(res.status === 401, `Status 401 (got ${res.status})`);
    assert(res.body?.error?.code === 'AUTH_REQUIRED', `Code AUTH_REQUIRED (got ${res.body?.error?.code})`);
  }

  // ── Test 4a: Wrong audience ───────────────────────────────────────────────
  console.log('\nTest 4a: Wrong audience claim');
  {
    const wrongAudToken = signTokenWrongAudience({ sub: 'user-7' });
    const res = await request({
      path: '/profile',
      headers: { Authorization: `Bearer ${wrongAudToken}` },
    });
    assert(res.status === 401, `Status 401 (got ${res.status})`);
    assert(res.body?.error?.code === 'AUTH_REQUIRED', `Code AUTH_REQUIRED (got ${res.body?.error?.code})`);
  }

  // ── Test 4b: Missing audience ─────────────────────────────────────────────
  console.log('\nTest 4b: Missing audience claim');
  {
    const noAudToken = signTokenNoAudience({ sub: 'user-7' });
    const res = await request({
      path: '/profile',
      headers: { Authorization: `Bearer ${noAudToken}` },
    });
    assert(res.status === 401, `Status 401 (got ${res.status})`);
    assert(res.body?.error?.code === 'AUTH_REQUIRED', `Code AUTH_REQUIRED (got ${res.body?.error?.code})`);
  }

  // ── Test 5: Valid token with correct audience passes ──────────────────────
  console.log('\nTest 5: Valid token with correct audience → 200');
  {
    const validToken = signToken({ sub: 'user-7' }); // includes audience: 'lu51-api'
    const res = await request({
      path: '/profile',
      headers: { Authorization: `Bearer ${validToken}` },
    });
    assert(res.status === 200, `Status 200 (got ${res.status})`);
    assert(res.body?.userId === 'user-7', `userId is user-7 (got ${res.body?.userId})`);
  }

  server.close();

  console.log(`\n${'─'.repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log('\nSome tests failed. Check your requireAuth implementation.');
    process.exit(1);
  } else {
    console.log('\nAll tests passed! ✓');
  }
}

runTests().catch((err) => {
  console.error('Test runner error:', err.message);
  process.exit(1);
});
