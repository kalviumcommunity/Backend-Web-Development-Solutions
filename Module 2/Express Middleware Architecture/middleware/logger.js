/**
 * logger middleware [mounted GLOBALLY in app.js — SOLUTION]
 *
 * Status code is only known once response finishes, so log inside the
 * response 'finish' event. next() is called immediately so request keeps moving.
 *
 * Example line:  [a3f9c1e2] POST /posts 201
 */

module.exports = function logger(req, res, next) {
  res.on('finish', () => {
    const shortId = req.id ? `[${req.id.substring(0, 8)}] ` : '';
    console.log(`${shortId}${req.method} ${req.path} ${res.statusCode}`);
  });
  next();
};
