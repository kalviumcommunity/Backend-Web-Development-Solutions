# LU55 — OAuth & Social Login (Solution)

Reference implementation. This is the solution repo: https://github.com/kalviumcommunity/Backend-Web-Development-Solutions

---

## Files implemented

Two files were added on top of the starter:

- `src/auth/passport.js` — `verifyCallback` with all three scenarios (returning user / link / create) and the unverified-email guard.
- `src/routes/auth.js` — callback handler that calls `signToken({ sub: req.user.id, role: req.user.role })` and responds `res.json({ token })`.

All other files are identical to the starter.

---

## How the solution works

### verifyCallback — three scenarios in order

```js
async function verifyCallback(accessToken, refreshToken, profile, done) {
  const googleId = profile.id;
  const email    = profile.emails[0].value;
  const name     = profile.displayName;

  // 1. Returning OAuth user — googleId already stored
  let user = users.find((u) => u.googleId === googleId);
  if (user) return done(null, user);

  // 2. Existing local account — email match, first Google login
  user = users.find((u) => u.email === email);
  if (user) {
    if (!profile._json.email_verified) return done(null, false);  // security guard
    user.googleId = googleId;
    return done(null, user);
  }

  // 3. Brand-new user
  const newUser = { id: nextId(), googleId, email, name, role: 'member' };
  users.push(newUser);
  return done(null, newUser);
}
```

**Why googleId before email:** `profile.id` is Google's permanent, immutable identifier. Email can change. Checking email first would create a duplicate account for any user who changed their linked email address. The `googleId` is the stable primary key.

**Why `email_verified` check:** the Google OAuth profile includes an `email_verified` flag. If it is `false`, the email address was not verified by Google — meaning an attacker could create a Google account with someone else's email and use it to take over that user's Threadbase account. Rejecting with `done(null, false)` blocks this completely.

### Callback handler — why your own JWT

```js
(req, res) => {
  const token = signToken({ sub: req.user.id, role: req.user.role });
  res.json({ token });
}
```

Google's `accessToken` cannot be used for your API because:
- It is scoped to Google's API, not yours.
- It expires on Google's schedule.
- Verifying it requires calling Google on every request (not stateless).
- It carries no `role` or custom claims your API needs.

Your `signToken` produces an HS256 JWT with your `ACCESS_SECRET`, your expiry (15 min), and your claims (`sub`, `role`). Every route uses `requireAuth` which verifies this token locally — no Google call on the hot path.

---

## What the tests check

`npm test` runs `tests/run.js`, which calls `verifyCallback` directly with mock profiles and makes HTTP requests to the running server. All 9 scenarios pass (18 assertions):

1. **Returning OAuth user** — Bob's `googleId` matches `u-2`. Returns existing user, no duplicate. Role (`moderator`) preserved.
2. **Link existing account** — Alice's email matches `u-1` (no `googleId`). `googleId` set on existing user, no new user created.
3. **Brand-new user** — Carol has no match. New user created and pushed to store.
4. **New user role** — Carol's user has `role: 'member'`.
5. **New user googleId** — Carol's user has `googleId === profile.id`.
6. **Unverified email rejected** — attacker profile with `email_verified: false` and Alice's email returns `false`. Alice's record is not modified.
7. **JWT round-trip** — `signToken` produces a verifiable JWT with correct `sub` and `role` claims.
8. **JWT on protected route** — issued token passes `requireAuth` on `GET /posts`, returns 200.
9. **No token → 401** — `GET /posts` without a token returns 401 from `requireAuth`.

Expected output:

```
Results: 18 passed, 0 failed
All tests passed! ✓
```
