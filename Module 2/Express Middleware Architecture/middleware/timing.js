/**
 * timing middleware [mounted GLOBALLY in app.js — SOLUTION]
 *
 * Captures start time on the way in, logs elapsed milliseconds on the
 * response 'finish' event.
 *
 * Example line:  [a3f9c1e2] POST /posts took 14ms
 */

module.exports = function timing(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const shortId = req.id ? `[${req.id.substring(0, 8)}] ` : '';
    console.log(`${shortId}${req.method} ${req.path} took ${Date.now() - start}ms`);
  });
  next();
};
