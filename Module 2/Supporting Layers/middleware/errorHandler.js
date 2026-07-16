/**
 * Central error handler — SOLUTION.
 * The duplicated AppError class is gone (shared copy lives in utils/AppError.js),
 * and the environment comes from config.nodeEnv, not process.env.
 */
const config = require('./../config');

module.exports = function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const body = { error: err.message || 'Internal Server Error' };

  // Only leak stack traces outside production.
  if (config.nodeEnv !== 'production' && err.stack) {
    body.stack = err.stack;
  }

  res.status(status).json(body);
};
