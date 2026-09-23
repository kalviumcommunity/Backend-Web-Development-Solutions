# LU 54 — Authorization & RBAC (Reference Solution)

Complete implementation of the authorization layer.

## What changed vs the starter

| File | Change |
|---|---|
| `src/middleware/requireRole.js` | Factory returns a middleware: `401` when `req.user` is absent, `403 FORBIDDEN` on role mismatch, else `next()`. |
| `src/app.js` | `DELETE /users/:id` gated with `requireRole('admin')`, placed after the global `requireAuth`. |
| `src/routes/posts.js` | `POST /posts/:id/hide` gated with `requireRole('moderator', 'admin')`; `PATCH`/`DELETE /posts/:id` use `loadOwnedOrPrivileged`, which returns 404 for a missing post and 403 when the caller is neither owner nor privileged — this closes the IDOR. |

## Run

```bash
npm install
cp .env.example .env
npm test      # Results: 12 passed, 0 failed
npm start     # http://localhost:3000
```

## What the tests check

`npm test` runs `tests/run.js`, which signs a token per role and exercises nine scenarios (12 assertions total):

1. **Owner edits own post → 200** — `loadOwnedOrPrivileged` finds `isOwner = true`, so the update proceeds.
2. **Member B edits A's post → 403** — the core deliverable. B is neither owner nor privileged, so the helper sends `403 FORBIDDEN` before any mutation. This is the closed IDOR.
3. **Moderator deletes any post → 200** — `isPrivileged = true` bypasses ownership.
4. **Member hides a post → 403** — blocked by `requireRole('moderator', 'admin')`.
5. **Moderator hides a post → 200** — passes the same gate.
6. **Member calls `DELETE /users/:id` → 403** — blocked by `requireRole('admin')`.
7. **Admin calls `DELETE /users/:id` → 200** — passes the admin gate.
8. **PATCH missing post `/posts/999` → 404** — the helper returns 404 before the ownership check, so existence is never leaked.
9. **No token on a protected route → 401** — produced by the existing `requireAuth`; confirms authentication runs before authorization.

Expected output:

```
Results: 12 passed, 0 failed
All tests passed! ✓
```

## Why test #2 returns 403

Member B is authenticated (valid token, known identity) but does not own post `1` and is not a moderator/admin. `loadOwnedOrPrivileged` computes `isOwner = false` and `isPrivileged = false`, so it sends `403 FORBIDDEN` before any mutation. The role gate and the ownership check are two layers of the same idea: authenticate first, then authorize — generically by role in middleware, and specifically by ownership in the handler.

## Solution repository

Reference solution lives in the solutions repo: https://github.com/kalviumcommunity/Backend-Web-Development-Solutions
