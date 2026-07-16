# Backend Data Flow (Domain Rules & Workflows) — Solution

Reference solution: three service-layer methods that encode product rules as guards.

## How This Was Solved

All work lives in `services/`. Routes, controllers, validators, and repositories are untouched — rules belong in the service layer, and a failed rule throws `AppError(message, status)` instead of touching `res`.

### 1. `services/postsService.js` → `editPost`
Guards in order, each throwing before any write:
```javascript
if (!post)                                    → AppError('Post not found', 404)
if (post.authorId !== userId)                 → AppError('You can only edit your own post', 403)
if (Date.now() - post.createdAt > 24h)        → AppError('Post can no longer be edited', 403)
return repo.update(postId, changes);
```
Order matters: existence first (nothing else can be checked on a missing post), then ownership, then the time window.

### 2. `services/votesService.js` → `castVote`
```javascript
if (!post)      → 404
if (existing)   → AppError('You have already voted on this post', 409)
return votesRepo.insert(postId, userId);
```
Without the duplicate guard, refreshing could inflate a post's score indefinitely.

### 3. `services/commentsService.js` → `addComment` (workflow)
All checks **before** any write:
```javascript
if (!post)        → 404
if (post.locked)  → 409
const comment = await commentsRepo.insert(...);  // write 1
await postsRepo.incrementCommentCount(postId);   // write 2
return comment;
```
If either check failed after a write, the store would hold a half-finished state (a comment on a locked post, or a count that doesn't match). Checks-first makes that impossible.

## Verify

```bash
npm install
npm start

# author edits own fresh post → 200
curl -X PATCH http://localhost:3000/posts/1 -H "Content-Type: application/json" -H "x-user-id: 1" -d "{\"title\":\"Edited\"}"

# vote twice → 201 then 409
curl -X POST http://localhost:3000/posts/1/votes -H "x-user-id: 5"
curl -X POST http://localhost:3000/posts/1/votes -H "x-user-id: 5"

# comment on locked post 3 → 409
curl -X POST http://localhost:3000/posts/3/comments -H "Content-Type: application/json" -H "x-user-id: 5" -d "{\"body\":\"Hello?\"}"
```
