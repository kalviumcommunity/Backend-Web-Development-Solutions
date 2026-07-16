/**
 * Posts router — SOLUTION.
 *
 * PER-ROUTE MOUNTING: `auditWrite` is mounted on the POST route only,
 * so it runs when someone creates a post but NOT when someone reads posts.
 * Contrast with the global middleware mounted once in app.js.
 */

const express = require('express');
const router = express.Router();

const auditWrite = require('../middleware/auditWrite');

const posts = [{ id: 1, title: 'Hello World' }];

// Public read — no extra middleware.
router.get('/', (req, res) => {
  res.json({ data: posts });
});

// Per-route middleware: auditWrite runs only here.
router.post('/', auditWrite, (req, res) => {
  const post = { id: posts.length + 1, title: req.body.title || 'Untitled' };
  posts.push(post);
  res.status(201).json({ data: post });
});

module.exports = router;
