'use strict';
// middleware/rateLimiter.js — SOLUTION
//
// A single strict limiter shared across the auth routes: 5 attempts per 15 minutes
// per IP. On the 6th, it returns 429 with a Retry-After header.

const rateLimit = require('express-rate-limit');

// ── Multi-instance note ──────────────────────────────────────────────────────
// The default store keeps counters in THIS Node process's memory. If the app runs
// as several instances behind a load balancer, each instance has its own counter,
// so a client spread across N instances effectively gets N times the limit.
//
// To enforce one shared limit across the whole cluster, use a Redis-backed store:
//
//   const { RedisStore } = require('rate-limit-redis');
//   const Redis = require('ioredis');
//   const redis = new Redis(process.env.REDIS_URL);
//   // then add to the options below:
//   //   store: new RedisStore({ sendCommand: (...args) => redis.call(...args) }),
//
// All instances then share one counter in Redis. The application code is unchanged
// apart from the `store` option.
// ─────────────────────────────────────────────────────────────────────────────

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,      // 15-minute window
  max: 5,                        // 5 attempts per window per IP
  standardHeaders: true,         // send RateLimit-* headers
  legacyHeaders: false,          // drop the deprecated X-RateLimit-* headers
  skipSuccessfulRequests: true,  // only failed attempts count — never punish a real login
  handler: (req, res) => {
    const resetMs = req.rateLimit && req.rateLimit.resetTime
      ? req.rateLimit.resetTime.getTime() - Date.now()
      : 15 * 60 * 1000;
    res.set('Retry-After', String(Math.max(1, Math.ceil(resetMs / 1000))));
    res.status(429).json({
      error: { code: 'RATE_LIMITED', message: 'Too many attempts, please try again later.' },
    });
  },
});

module.exports = authLimiter;
