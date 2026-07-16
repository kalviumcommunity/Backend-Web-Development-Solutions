/**
 * validateRequest — SOLUTION: shared middleware that collects
 * express-validator results and returns a structured 422.
 * Previously written inline in routes/articles.js.
 */
const { validationResult } = require('express-validator');

module.exports = function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
};
