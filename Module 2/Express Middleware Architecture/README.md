# Express Middleware Architecture — Solution

Reference solution for the middleware pipeline assignment.

## How This Was Solved

### 1. `middleware/requestId.js`
Generates `crypto.randomUUID()`, attaches it to `req.id`, sets `X-Request-Id` response header, calls `next()`. It must run **first** so every later middleware can read `req.id`.

### 2. `middleware/logger.js`
Status code exists only after the response is done, so the log line is registered on `res.on('finish', ...)`. `next()` is called immediately — the middleware never blocks the request.

### 3. `middleware/timing.js`
Captures `Date.now()` on the way in, logs elapsed ms inside the `'finish'` event. Same pattern as logger: observe on finish, pass control immediately.

### 4. `app.js` — mounting order
```javascript
app.use(requestId); // first: creates req.id
app.use(logger);    // can read req.id
app.use(timing);    // can read req.id
```
Order is deliberate. If `requestId` ran last, logger and timing would print without an id.

### 5. `routes/posts.js` — per-route mounting
```javascript
router.post('/', auditWrite, handler);
```
`auditWrite` runs only on the write route — the per-route contrast to the three global middleware.

## Run

```bash
npm install
npm start
curl -X POST http://localhost:3000/posts -H "Content-Type: application/json" -d '{"title":"Hi"}'
```

Expected console output shape:

```text
[AUDIT] [a3f9c1e2] Write request received for POST /posts
[a3f9c1e2] POST /posts 201
[a3f9c1e2] POST /posts took 3ms
```
