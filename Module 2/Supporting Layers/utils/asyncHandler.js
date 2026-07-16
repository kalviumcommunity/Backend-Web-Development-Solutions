/**
 * asyncHandler — SOLUTION: wraps an async route handler and forwards any
 * rejection to next(), removing per-controller try/catch boilerplate.
 */
module.exports = function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
