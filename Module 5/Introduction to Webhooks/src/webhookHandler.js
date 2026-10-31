'use strict';

const crypto = require('node:crypto');
const { handleEvent } = require('./eventHandlers');

// In-memory store: use DB UNIQUE constraint or Redis TTL in production
const _processedIds = new Set();

function verifySignature(rawBody, sigHeader, secret) {
  if (!sigHeader) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  const received = sigHeader.split('=').slice(1).join('=');
  if (!received || Buffer.byteLength(expected) !== Buffer.byteLength(received)) return false;
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(received,  'hex'),
  );
}

async function handleWebhook(req, res) {
  // 1. Verify HMAC-SHA256 signature over raw body Buffer
  const sig = req.headers['x-webhook-signature'];
  if (!verifySignature(req.body, sig, process.env.WEBHOOK_SECRET || 'testsecret')) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 2. Parse the body after verification
  const event = JSON.parse(req.body);

  // 3. Idempotency: skip already-processed events
  if (_processedIds.has(event.id)) {
    return res.status(200).json({ status: 'already_processed' });
  }

  // 4. Mark as processed (before acknowledging, to avoid race on concurrent replays)
  _processedIds.add(event.id);

  // 5. Acknowledge immediately: before any slow work
  res.status(200).json({ status: 'received' });

  // 6. Process after the response is sent
  setImmediate(async () => {
    try {
      await handleEvent(event);
    } catch (err) {
      console.error(`[webhook] handleEvent failed for ${event.id}:`, err.message);
    }
  });
}

module.exports = { handleWebhook, _processedIds };
