'use strict';
// auth/passport.js — Google OAuth strategy (SOLUTION)

const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { users, nextId } = require('../data');

async function verifyCallback(accessToken, refreshToken, profile, done) {
  try {
    const googleId = profile.id;
    const email    = profile.emails[0].value;
    const name     = profile.displayName;

    // ── Scenario A: Returning OAuth user ──────────────────────────────────
    // User logged in via Google before; their googleId is already stored.
    let user = users.find((u) => u.googleId === googleId);
    if (user) return done(null, user);

    // ── Scenario B: Existing local account, first Google login ────────────
    // A user who registered with email + password is now using Google login.
    // We match by email and link the googleId to avoid a duplicate account.
    // Security: only link when Google has verified the email address.
    user = users.find((u) => u.email === email);
    if (user) {
      if (!profile._json.email_verified) {
        // Reject: an unverified email could be used to hijack an existing account.
        return done(null, false);
      }
      user.googleId = googleId;    // link — one-time write
      return done(null, user);
    }

    // ── Scenario C: Brand-new user ────────────────────────────────────────
    // No match at all. Create the account with the least-privilege role.
    const newUser = {
      id:       nextId(),
      googleId,
      email,
      name,
      role:     'member',          // always start at the lowest role
    };
    users.push(newUser);
    return done(null, newUser);

  } catch (err) {
    return done(err);
  }
}

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID     || 'test-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'test-client-secret',
      callbackURL:  '/auth/google/callback',
    },
    verifyCallback,
  ),
);

module.exports = { passport, verifyCallback };
