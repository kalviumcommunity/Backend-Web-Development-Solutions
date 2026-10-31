'use strict';
// routes/auth.js (SOLUTION)

const router       = require('express').Router();
const { passport } = require('../auth/passport');
const { signToken } = require('../utils/jwt');

// Triggers the OAuth flow — Passport builds the redirect URL and sends 302 to Google
router.get(
  '/google',
  passport.authenticate('google', {
    scope:   ['openid', 'email', 'profile'],
    session: false,
  }),
);

// Google's callback — Passport catches the code, exchanges it, runs verifyCallback,
// sets req.user, and calls next(). Then we issue the app JWT.
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session:         false,
    failureRedirect: '/auth/failure',
  }),
  (req, res) => {
    // Issue OUR own JWT — not Google's access_token.
    // This token is what the client uses on all subsequent API calls.
    const token = signToken({ sub: req.user.id, role: req.user.role });
    res.json({ token });

    // In a real SPA you would redirect instead:
    // res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
  },
);

router.get('/failure', (_req, res) => {
  res.status(401).json({ error: { code: 'OAUTH_FAILED', message: 'Google login failed or was denied' } });
});

module.exports = router;
