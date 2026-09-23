// Factory: takes the allowed roles, returns a middleware.
// Runs AFTER requireAuth, so req.user is already trusted.
module.exports = function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      // No verified identity — this is an authentication problem.
      return res
        .status(401)
        .json({ error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } });
    }
    if (!allowedRoles.includes(req.user.role)) {
      // Known identity, insufficient role — a permission problem.
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Insufficient role' } });
    }
    next();
  };
};
