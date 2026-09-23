'use strict';
// routes/payments.js — SOLUTION
// POST /payments processes a charge exactly once per idempotency key.

const router = require('express').Router();
const { charges, idempotency, nextChargeId } = require('../store');

router.post('/', (req, res) => {
  const key = req.headers['idempotency-key'];

  // 1. A missing key means we cannot deduplicate — reject with a validation error.
  if (!key) {
    return res.status(400).json({
      error: { code: 'IDEMPOTENCY_KEY_REQUIRED', message: 'Idempotency-Key header is required' },
    });
  }

  // 2. Seen this key before? Return the stored response and do NOT charge again.
  if (idempotency.has(key)) {
    const saved = idempotency.get(key);
    return res.status(saved.status).json(saved.body);
  }

  // 3. First time for this key — perform the charge exactly once.
  const amount = req.body && req.body.amount;
  const charge = { id: nextChargeId(), amount, status: 'charged' };
  charges.push(charge);

  // 4. Store the key with its response, then return it.
  const body = { id: charge.id, amount: charge.amount, status: charge.status };
  idempotency.set(key, { status: 201, body });
  return res.status(201).json(body);
});

module.exports = router;
