# LU 51 — Authentication Middleware Solution

## Setup

```bash
cp .env.example .env
npm install
npm start
```

## Test manually

```bash
# Get a test token
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"sub":"user-7"}' | jq .

# Use the token (replace TOKEN)
curl -s -H "Authorization: Bearer TOKEN" http://localhost:3000/profile | jq .

# No token → 401
curl -s http://localhost:3000/profile | jq .

# Bad token → 401
curl -s -H "Authorization: Bearer not.a.valid.token" http://localhost:3000/profile | jq .

# Wrong scheme → 401
curl -s -H "Authorization: Basic dXNlcjpwYXNz" http://localhost:3000/profile | jq .
```

## Key implementation: src/middleware/requireAuth.js

The `requireAuth` middleware:

1. Reads `Authorization` header with `?? ''` default.
2. Extracts Bearer token via strict regex — null if no match.
3. Returns 401 immediately if token is null.
4. Calls `jwt.verify` with `{ algorithms: ['HS256'] }` in a try block.
5. Sets `req.user = payload` and calls `next()` on success.
6. Returns identical generic 401 in catch block for all failure types.
