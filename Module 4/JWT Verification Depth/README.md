# LU 51.1 — JWT Verification Depth Solution

## Setup

```bash
cp .env.example .env
npm install
npm start
```

## Run tests

```bash
npm test
```

## What was extended

**`src/middleware/requireAuth.js`:**
- Added `audience: 'lu51-api'` to `jwt.verify` options → rejects wrong/missing audience.
- Added `console.error` logging in catch block → internal observability without client exposure.

**`tests/verify-depth.js`:**
- Test 1: Missing header → 401.
- Test 2: Expired token → 401 (generic, not "token expired").
- Test 3: Invalid signature + malformed → 401.
- Test 4: Wrong audience + missing audience → 401.
- Test 5: Valid token with correct audience → 200.
