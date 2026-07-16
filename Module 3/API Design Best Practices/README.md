# LU34 - Solution Repo

Reference implementation for LU34 project artifact.

## What This Solution Does

This solution keeps same business capability, but refactors API contract to be more predictable for clients.

### 1. Route design fixed
Old public contract used verb-heavy routes like:
- `GET /getPosts`
- `GET /getPost/:id`
- `POST /createPost`
- `POST /likePost/:id`

Solution replaces them with resource-oriented routes:
- `GET /posts`
- `GET /posts/:id`
- `POST /posts`
- `POST /posts/:id/likes`

This makes route family easier to infer.

### 2. Success response contract standardised
Starter had mixed success shapes like raw arrays, `{ post }`, and `{ ok: true }`.

Solution standardises success responses to:
- `200 -> { data: ... }`
- `201 -> { data: ... }`
- list route -> `{ data: [...], meta: { page, limit, total, pages } }`

This reduces client-side branching.

### 3. Error design made safe and consistent
Starter leaked internal-style messages and stack/debug detail.

Solution uses one structured error family:
- `404 -> { error: { code: 'NOT_FOUND', message: 'Post not found' } }`
- `500 -> { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } }`

Internal details stay out of public response.

### 4. List endpoint improved
Starter list returned full array with no metadata.

Solution adds:
- server-side `limit` cap
- `page` handling
- `total` and `pages`
- `meta` block for client continuation

### 5. Old public routes removed
Solution does not keep old verb routes as public contract.

## Structure

```text
src/
  app.js
  routes/
  controllers/
  services/
  utils/
  data/
```

## Use

Read only after attempting starter independently.
