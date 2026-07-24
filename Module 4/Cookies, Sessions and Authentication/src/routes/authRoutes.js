const express = require('express');
const authService = require('../services/authService');
const sessionStore = require('../session/sessionStore');
const requireSession = require('../middleware/requireSession');
const { COOKIE_NAME, cookieOptions, clearCookieOptions } = require('../session/cookieConfig');

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const user = await authService.verifyCredentials(req.body);
    const session = sessionStore.create(user.id);
    res.cookie(COOKIE_NAME, session.id, cookieOptions());
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireSession, (req, res) => {
  res.status(200).json({ data: req.user });
});

router.post('/logout', (req, res) => {
  const sessionId = req.signedCookies[COOKIE_NAME];
  sessionStore.destroy(sessionId);
  res.clearCookie(COOKIE_NAME, clearCookieOptions());
  res.status(204).send();
});

module.exports = router;
