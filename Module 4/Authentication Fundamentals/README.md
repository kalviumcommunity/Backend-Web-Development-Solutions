# Authentication Fundamentals Solution

## Setup

```bash
npm install
cp .env.example .env
npm run db:push
npm start
```

API listens on `PORT` or `3000`. `.env` and `prisma/dev.db` are ignored.

## Verify

```bash
# Register → 201; response contains id/name/email only
curl -i -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Sam","email":"Sam@Example.com","password":"correct horse battery staple"}'

# Login → 200; mixed-case email follows same normalization policy
curl -i -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sam@example.com","password":"correct horse battery staple"}'

# Wrong password and unknown email → identical 401 JSON
curl -i -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sam@example.com","password":"wrong"}'
curl -i -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"missing@example.com","password":"wrong"}'
```

Also verify duplicate registration returns `409`, malformed input returns `400`, and stored `passwordHash` verifies with bcrypt while plaintext/hash never appears in responses or logs. Missing-account login compares against a valid precomputed dummy hash to reduce coarse timing differences; this does not guarantee identical end-to-end timing.

bcrypt accepts at most 72 input bytes. Solution rejects registration values that `bcrypt.truncates(password)` identifies rather than silently accepting equivalent truncated passwords.
