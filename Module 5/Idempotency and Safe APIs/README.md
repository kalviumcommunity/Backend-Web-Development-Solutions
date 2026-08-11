# LU57 — Idempotency & Safe APIs (Solution)

Reference implementation. Solution repo: https://github.com/kalviumcommunity/Backend-Web-Development-Solutions

## File implemented

Only `src/routes/payments.js` changes from the starter.

```js
router.post('/', (req, res) => {
  const key = req.headers['idempotency-key'];

  // 1. missing key -> validation error (cannot deduplicate without it)
  if (!key) {
    return res.status(400).json({
      error: { code: 'IDEMPOTENCY_KEY_REQUIRED', message: 'Idempotency-Key header is required' },
    });
  }

  // 2. repeat key -> cached response, no new charge
  if (idempotency.has(key)) {
    const saved = idempotency.get(key);
    return res.status(saved.status).json(saved.body);
  }

  // 3. new key -> charge exactly once, store the response, return it
  const amount = req.body && req.body.amount;
  const charge = { id: nextChargeId(), amount, status: 'charged' };
  charges.push(charge);
  const body = { id: charge.id, amount: charge.amount, status: charge.status };
  idempotency.set(key, { status: 201, body });
  return res.status(201).json(body);
});
```

## Why it works

- **The key encodes intent.** The client reuses one key for one purchase (including every retry) and a fresh key for a new purchase. The server never guesses — the key tells it "same operation" or "new operation."
- **Store the full response.** Caching `{ status, body }` means a retry returns the *identical* result, so the client sees success without a second charge.
- **Reject a missing key.** With no key, two retries are indistinguishable from two purchases — you would double-charge. A `400` forces the client to send a key.

## What the tests check

`npm test` runs six scenarios (14 assertions): first charge, same-key dedup (no new charge), different-key separate charge, missing-key 400, second-key retry dedup, and exactly-once overall. Expected:

```
Results: 14 passed, 0 failed
All tests passed! ✓
```

## Production notes

- Swap the in-memory `Map` for a database table keyed by the idempotency key.
- Lock or mark a key as "pending" so two concurrent retries do not both slip through.
- Expire keys with a TTL (hours to a day) so the store stays bounded.
