const sessionStore = require('../session/sessionStore');
const userRepository = require('../repositories/userRepository');
const { COOKIE_NAME } = require('../session/cookieConfig');
const AppError = require('../errors/AppError');

async function requireSession(req, res, next) {
  try {
    const sessionId = req.signedCookies[COOKIE_NAME];
    const session = sessionId && sessionStore.get(sessionId);
    if (!session) throw new AppError(401, 'AUTH_REQUIRED', 'Authentication required');
    const user = await userRepository.findPublicById(session.userId);
    if (!user) {
      sessionStore.destroy(sessionId);
      throw new AppError(401, 'AUTH_REQUIRED', 'Authentication required');
    }
    req.sessionId = sessionId;
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = requireSession;
