# LU58 — Rate Limiting & Abuse Prevention (Solution)

Reference implementation. Solution repo: https://github.com/kalviumcommunity/Backend-Web-Development-Solutions

## File implemented

Only `src/middleware/rateLimiter.js` changes from the starter.

```js
const rateLimit = require('express-rate-limit');

// Multi-instance note: the default store keeps counters in THIS process's memory,
// so N instances behind a load balancer give a client N× the limit. A Redis store
// shares one counter across the cluster:
//   const { RedisStore } = require('rate-limit-redis');
//   store: new RedisStore({ sendCommand: (...a) => redis.call(...a) }),

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    const resetMs = req.rateLimit && req.rateLimit.resetTime
      ? req.rateLimit.resetTime.getTime() - Date.now()
      : 15 * 60 * 1000;
    res.set('Retry-After', String(Math.max(1, Math.ceil(resetMs / 1000))));
    res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Too many attempts, please try again later.' } });
  },
});

module.exports = authLimiter;
```

## Why it works

- **One shared limiter on the auth routes.** `auth.js` applies this instance to login, register, and refresh, so 5 failed attempts across those routes trigger the 429. `GET /health` has no limiter, so it stays open — the limiter is scoped, not global.
- **`skipSuccessfulRequests`.** Only failed (non-2xx) attempts count, so a legitimate user who logs in on the first try never consumes the quota; a password-guessing bot, whose attempts fail, hits the wall in five.
- **`Retry-After`.** The custom handler computes seconds until the window resets and sets the header, so a well-behaved client backs off instead of hammering.

## Why the in-memory store fails at scale

The default `MemoryStore` lives in one Node process. With three instances behind a load balancer, each keeps its own counter, so a client whose requests are spread across them can send `3 × 5 = 15` before any single instance blocks. A Redis-backed store moves the counter into one shared Redis instance every app server reads, enforcing the true limit across the cluster — the only code change is the `store` option.

## What the tests check

`npm test` runs four scenarios (5 assertions): first 5 attempts return 401, the 6th returns 429, the 429 carries a positive `Retry-After`, and `GET /health` still returns 200. Expected:

```
Results: 5 passed, 0 failed
All tests passed! ✓
```
