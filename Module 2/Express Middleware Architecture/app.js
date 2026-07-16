/**
 * Express Middleware Architecture — SOLUTION
 *
 * Three global middleware are implemented and mounted in deliberate order:
 *   1) requestId — must run FIRST so logger and timing can read req.id
 *   2) logger    — logs method, path, status on response finish
 *   3) timing    — logs elapsed milliseconds on response finish
 *
 * Per-route mounting example: `auditWrite` runs only on POST /posts
 * (see routes/posts.js), not on reads.
 */

const express = require('express');

const postsRouter = require('./routes/posts');
const usersRouter = require('./routes/users');

const requestId = require('./middleware/requestId');
const logger = require('./middleware/logger');
const timing = require('./middleware/timing');

const app = express();

app.use(express.json());

// Global middleware — order matters: requestId first, so the rest can read req.id.
app.use(requestId);
app.use(logger);
app.use(timing);

// Two mounted routers.
app.use('/posts', postsRouter);
app.use('/users', usersRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

module.exports = app;
