# Threadbase Reliability Control Room — Solution

```bash
npm start
```

`profileService.js` composes `withRetry(() => withTimeout(...))` then returns `DEFAULT_AVATAR` only after an error reaches `getProfileWithAvatar`.

- timeout aborts each attempt and clears timer;
- retry accepts AbortError, network error, 429, 5xx; backs off exponentially;
- 400 fails immediately and falls back;
- avatar is non-essential, so profile responds degraded rather than failing.
