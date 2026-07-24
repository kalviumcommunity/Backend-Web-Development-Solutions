# LU48 Solution — Session Authentication

## Setup

```bash
cp .env.example .env
# Replace COOKIE_SECRET with at least 32 random characters.
npm install
npm run setup
npm start
```

Seeded demo account: `sam@example.com` / `SessionDemo!48`.

Keep `COOKIE_SECURE=false` for local HTTP testing. Production must serve HTTPS and set `COOKIE_SECURE=true`; browsers correctly refuse to send a Secure cookie over plain HTTP.

## Verify

```bash
curl -i -c cookies.txt -H "Content-Type: application/json" \
  -d '{"email":"sam@example.com","password":"SessionDemo!48"}' \
  http://localhost:3000/auth/login

curl -i -b cookies.txt http://localhost:3000/auth/me

curl -i -b cookies.txt -c cookies.txt -X POST http://localhost:3000/auth/logout

curl -i -b cookies.txt http://localhost:3000/auth/me
```

Expected sequence: `200`, `200`, `204`, `401`. Login `Set-Cookie` includes `sid`, `HttpOnly`, `SameSite=Lax`, path, expiry, and a signature. Logout clears the cookie and deletes its server record.

## Production boundary

The `Map` store intentionally demonstrates lifecycle with no external infrastructure. It loses sessions on restart and cannot coordinate multiple processes. Production should use a shared expiring store such as Redis, rotate cookie secrets deliberately, use HTTPS, add CSRF defenses appropriate to the API, and apply login rate limits.
