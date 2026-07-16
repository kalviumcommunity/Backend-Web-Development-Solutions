# Threadbase Reliability Control Room

Threadbase profile cards call an avatar service. Avatar data improves feed, but it must never make profile/feed unavailable. Product team reports three incidents:

- brief avatar-service blip produced visible errors;
- slow avatar service left requests waiting forever;
- full outage broke profile cards instead of showing placeholder.

Build reliability wrapper in `src/services/profileService.js`. **Only edit this file.** Open PR with implementation plus short explanation of policy choices.

## Starter structure

```text
src/
  app.js                         # scenario runner — do not edit
  clients/avatarClient.js        # deterministic fake dependency — do not edit
  services/profileService.js     # your work
```

## Required behavior

### 1. Set timeout per attempt
Implement `withTimeout(operation, timeoutMs)` using `AbortController`.

- Call `operation(controller.signal)`.
- Abort at `timeoutMs`.
- Clear timer in `finally`.
- A `slow` scenario must resolve through fallback, not hang.

### 2. Retry correct failures
Implement `isRetryable(error)` and `withRetry(operation, options)`.

- Default: `maxAttempts = 3`.
- Retry `AbortError`, network errors (no status), `429`, and `5xx`.
- Do **not** retry ordinary `4xx` errors, including `400`.
- Exponential backoff: `baseDelayMs * 2 ** attempt` between attempts.
- Throw immediately for non-retryable error; throw final retryable error after final attempt.

### 3. Compose wrapper and degrade safely
Implement `getProfileWithAvatar` using this order:

```text
fallback( retry( timeout( avatarClient.getAvatar ) ) )
```

- Healthy: return real avatar, `degraded: false`.
- Blip: first `503` retries then returns real avatar, `degraded: false`.
- Slow/down: return `DEFAULT_AVATAR`, `degraded: true`.
- Bad request (`400`): no retry; return fallback immediately.

## Manual verification

```bash
npm start
```

Expected signals:

| Scenario | Calls | `degraded` | Avatar |
|---|---:|---|---|
| `healthy` | 1 | false | real avatar |
| `blip` | 2 | false | real avatar |
| `slow` | 3 | true | default |
| `down` | 3 | true | default |
| `badRequest` | 1 | true | default |

## PR requirements

1. Push branch and open PR.
2. PR description: explain timeout → retry → fallback order in 3–5 sentences.
3. State why `400` is not retried and why avatar failure may fail open.
4. Attach terminal output from `npm start`.

No tests required. Reviewer evaluates implementation, scenario output, and reasoning.
