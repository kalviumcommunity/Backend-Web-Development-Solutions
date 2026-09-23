/**
 * requireAuth — JWT Bearer token authentication middleware with full verification depth.
 *
 * Handles:
 *   - Missing or wrong-scheme Authorization header → 401
 *   - Expired token (TokenExpiredError)            → 401
 *   - Invalid signature (JsonWebTokenError)        → 401
 *   - Wrong or missing audience                    → 401
 *
 * Internal error logging: error name and message logged to console.error.
 * External contract: identical generic 401 for all failure modes.
 */

const jwt = require('jsonwebtoken');
const { AUDIENCE } = require('../utils/jwt');

module.exports = function requireAuth(req, res, next) {
  // Step 1: Extract Bearer token
  const authHeader = req.headers.authorization ?? '';
  const match = /^Bearer ([^\s]+)$/i.exec(authHeader);
  const token = match ? match[1] : null;

  // Step 2: Missing or wrong-scheme header
  if (!token) {
    return res.status(401).json({
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
    });
  }

  // Step 3: Verify with full policy — algorithm + audience
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      audience: AUDIENCE,   // rejects tokens with wrong or missing aud claim
    });

    req.user = payload;
    next();
  } catch (error) {
    // Internal observability — never reaches the client
    console.error(`[requireAuth] ${error.name}: ${error.message}`);

    // Same generic 401 for every failure mode:
    //   TokenExpiredError           → expired
    //   JsonWebTokenError           → invalid signature, malformed, wrong audience
    //   NotBeforeError              → nbf not reached
    return res.status(401).json({
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
    });
  }
};
