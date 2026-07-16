/**
 * requestId middleware [mounted GLOBALLY in app.js — SOLUTION]
 *
 * Runs first in the pipeline so every later middleware and handler can read req.id.
 */

const { randomUUID } = require('crypto');

module.exports = function requestId(req, res, next) {
  req.id = randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
};
