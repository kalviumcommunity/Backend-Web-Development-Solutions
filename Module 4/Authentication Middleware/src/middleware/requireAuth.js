const jwt = require('jsonwebtoken');

/**
 * requireAuth — JWT Bearer token authentication middleware.
 *
 * Exit paths:
 *   Success: req.user = verified payload, next() called.
 *   Failure: res.status(401).json({ error: { code: 'AUTH_REQUIRED' } })
 *
 * Failure conditions (all produce identical 401):
 *   - No Authorization header
 *   - Wrong scheme (not Bearer)
 *   - Token is null / empty
 *   - Token expired (TokenExpiredError)
 *   - Token invalid signature (JsonWebTokenError)
 *   - Token malformed (JsonWebTokenError)
 */
module.exports = function requireAuth(req, res, next) {
  // Step 1: Extract Bearer token from Authorization header
  const authHeader = req.headers.authorization ?? '';
  const match = /^Bearer ([^\s]+)$/i.exec(authHeader);
  const token = match ? match[1] : null;

  // Step 2: Reject missing or wrong-scheme header immediately
  if (!token) {
    return res.status(401).json({
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
    });
  }

  // Step 3: Verify token with explicit policy
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    // Step 4: Attach verified identity to request
    req.user = payload;

    // Step 5: Pass to route handler
    next();
  } catch (_error) {
    // Step 6: Generic 401 for all verification failures
    // Do not distinguish error types externally — same body for all failures.
    return res.status(401).json({
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
    });
  }
};
