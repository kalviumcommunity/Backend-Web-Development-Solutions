'use strict';

const _store = new Map();

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function storeOTP(email, otp) {
  _store.set(email, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
  });
}

function verifyOTP(email, code) {
  const entry = _store.get(email);

  // 1. Not found
  if (!entry) return { ok: false, reason: 'not_found' };

  // 2. Expired
  if (Date.now() > entry.expiresAt) {
    _store.delete(email);
    return { ok: false, reason: 'expired' };
  }

  // 3. Too many attempts
  if (entry.attempts >= 3) {
    return { ok: false, reason: 'too_many_attempts' };
  }

  // 4. Wrong code
  if (entry.otp !== code) {
    entry.attempts += 1;
    return { ok: false, reason: 'wrong_code' };
  }

  // 5. Correct
  _store.delete(email);
  return { ok: true };
}

function markVerified(email) {
  console.log(`Email verified: ${email}`);
}

module.exports = { generateOTP, storeOTP, verifyOTP, markVerified, _store };
