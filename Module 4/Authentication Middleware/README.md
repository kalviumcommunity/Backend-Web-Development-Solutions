# LU 51 — Authentication Middleware (Solution)

This is the reference solution for the Authentication Middleware assignment. It shows a correct implementation of `requireAuth` — an Express middleware that reads a Bearer JWT from the `Authorization` header, verifies it, attaches the payload to `req.user`, and returns 401 for every failure mode.

---

## How to clone and run

### Step 1 — Clone the solutions repository

```bash
git clone https://github.com/kalviumcommunity/Backend-Web-Development-Solutions.git
cd "Backend-Web-Development-Solutions/Module 4/Authentication Middleware"
```

### Step 2 — Copy the environment file

```bash
cp .env.example .env
```

The `.env.example` already contains the correct test secret. Do not change it — the test suite uses the same value.

```
JWT_SECRET=lu51-test-secret-do-not-use-in-production-32chars
PORT=3000
```

### Step 3 — Install dependencies

```bash
npm install
```

### Step 4 — Start the server

```bash
npm start
```

Server runs on `http://localhost:3000`. You should see:

```
Auth middleware solution listening on 3000
```

---

## Run the automated tests

```bash
npm test
```

Expected output — all 13 assertions pass:

```
LU 51 — Authentication Middleware Tests

Test 1: Missing Authorization header
  ✓ Status is 401 (got 401)
  ✓ Body has error.code AUTH_REQUIRED (got AUTH_REQUIRED)

Test 2: Invalid/tampered token
  ✓ Status is 401 (got 401)
  ✓ Body has error.code AUTH_REQUIRED (got AUTH_REQUIRED)

Test 2b: Wrong scheme (Basic)
  ✓ Status is 401 (got 401)

Test 3: Valid token attaches req.user
  ✓ Status is 200 (got 200)
  ✓ userId is user-7 (got user-7)

Test 4: Protected routes respond correctly with valid token
  ✓ GET /posts/my returns 200 (got 200)
  ✓ POST /posts returns 201 (got 201)

Test 5: Expired token returns 401
  ✓ Status is 401 (got 401)
  ✓ Same generic AUTH_REQUIRED (got AUTH_REQUIRED)

Test 6: Public route (POST /auth/login) accessible without token
  ✓ POST /auth/login returns 200 (got 200)
  ✓ Response contains a token string

────────────────────────────────────────
Results: 13 passed, 0 failed

All tests passed! ✓
```

---

## Test manually with curl

**Step 1 — Get a token from the public login route:**

```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"sub":"user-7"}'
```

Response:

```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

Copy the token value.

---

**Step 2 — Call a protected route with the token (expect 200):**

```bash
curl -s -H "Authorization: Bearer <PASTE_TOKEN_HERE>" \
  http://localhost:3000/profile
```

Response:

```json
{ "userId": "user-7", "message": "Profile data" }
```

`req.user.sub` was set to `"user-7"` by the middleware and the handler read it.

---

**Step 3 — Call with no token (expect 401):**

```bash
curl -s http://localhost:3000/profile
```

Response:

```json
{ "error": { "code": "AUTH_REQUIRED", "message": "Authentication required" } }
```

No Authorization header → regex produces null → null check fires → 401 before `jwt.verify` ever runs.

---

**Step 4 — Call with wrong scheme (expect 401):**

```bash
curl -s -H "Authorization: Basic dXNlcjpwYXNz" \
  http://localhost:3000/profile
```

Response: same 401 body.

The regex `/^Bearer ([^\s]+)$/i` requires the `Bearer` prefix. `Basic` does not match → null → 401.

---

**Step 5 — Call with a tampered or invalid token (expect 401):**

```bash
curl -s -H "Authorization: Bearer not.a.real.jwt" \
  http://localhost:3000/profile
```

Response: same 401 body.

The token passes regex and null check, reaches `jwt.verify`, which throws `JsonWebTokenError` → caught → 401.

---

## File structure

```
src/
├── app.js                     ← Express app: public login + 3 protected routes
├── middleware/
│   └── requireAuth.js         ← The middleware implementation (see below)
└── utils/
    └── jwt.js                 ← signToken helper used by login and tests
tests/
└── run.js                     ← Automated test suite (no external framework)
.env.example                   ← Copy to .env before running
package.json
```

---

## How `requireAuth` works

Full implementation in `src/middleware/requireAuth.js`:

```js
const jwt = require('jsonwebtoken');

module.exports = function requireAuth(req, res, next) {

  // 1. Read the Authorization header safely
  const authHeader = req.headers.authorization ?? '';

  // 2. Extract Bearer token — null if missing or wrong scheme
  const match = /^Bearer ([^\s]+)$/i.exec(authHeader);
  const token = match ? match[1] : null;

  // 3. No token → 401 immediately (EXIT A)
  if (!token) {
    return res.status(401).json({
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
    });
  }

  // 4. Verify token — explicit algorithm, trusted secret
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    // 5. Attach verified identity — only after verify succeeds
    req.user = payload;
    next(); // EXIT B — route handler runs

  } catch (_error) {
    // 6. All verify failures → same 401 (EXIT C)
    return res.status(401).json({
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
    });
  }
};
```

### The three exits

| Exit | Condition | Response |
|---|---|---|
| **A** | Token is null (missing header / wrong scheme) | `401 AUTH_REQUIRED` |
| **B** | `jwt.verify` succeeds | `req.user` set → `next()` → route handler runs |
| **C** | `jwt.verify` throws (expired / invalid / malformed) | `401 AUTH_REQUIRED` |

Exit A and Exit C return **byte-for-byte identical** JSON. This is intentional — the client learns nothing about which check failed.

---

## Routes in the app

```js
// PUBLIC — no requireAuth
app.post('/auth/login', ...)       // signs and returns a test token

// PROTECTED — requireAuth runs before the handler
app.get('/profile',   requireAuth, ...)   // reads req.user.sub
app.get('/posts/my',  requireAuth, ...)   // reads req.user.sub
app.post('/posts',    requireAuth, ...)   // reads req.user.sub
```

The login route must be public — it is where users get their token. Wrapping it with `requireAuth` would mean nobody could ever authenticate.
