'use strict';

// In-memory OTP store (use Redis with TTL in production for multi-instance safety)
const _store = new Map();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();  // 6 digits
}

function storeOTP(email, otp) {
  _store.set(email, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,  // 10 minutes
    attempts: 0,
  });
}

// Used by tests to inject a custom entry (e.g. with a past expiresAt)
function _storeForTest(email, entry) {
  _store.set(email, entry);
}

function verifyOTP(email, code) {
  const entry = _store.get(email);

  if (!entry) {
    return { ok: false, reason: 'not_found' };
  }

  if (Date.now() > entry.expiresAt) {
    _store.delete(email);
    return { ok: false, reason: 'expired' };
  }

  if (entry.attempts >= 3) {
    return { ok: false, reason: 'too_many_attempts' };
  }

  if (entry.otp !== code) {
    entry.attempts++;
    return { ok: false, reason: 'wrong_code' };
  }

  // Correct, consume the OTP (single-use)
  _store.delete(email);
  return { ok: true };
}

function markVerified(email) {
  // In production: update the users table verified = true
  console.log(`[verified] ${email}`);
}

module.exports = { generateOTP, storeOTP, verifyOTP, markVerified, _store, _storeForTest };
