# Backend Web Development — Solutions

Reference **solutions** for the Project Artifact (PR-based) assignments in the
**Backend Web Development** course. This repo mirrors the folder layout of the
[starter repo](https://github.com/kalviumcommunity/Backend-Web-Development), so every
assignment's solution lives at the same path as its starter.

> **For mentors and evaluators.** Students should attempt the starter independently
> and only consult a solution after submitting, or when a mentor walks them through it.

---

## Solutions in this repo

| Module | Assignment | What the solution demonstrates |
|---|---|---|
| Module 2 | [Node.js Runtime Features](./Module%202/Node.js%20Runtime%20Features) | fs/streams/runtime feature tasks completed against the brief |
| Module 2 | [Express Middleware Architecture](./Module%202/Express%20Middleware%20Architecture) | requestId → logger → timing global pipeline, per-route `auditWrite` |
| Module 2 | [Supporting Layers](./Module%202/Supporting%20Layers) | validators/, utils/ (AppError, asyncHandler, validateRequest), config/ as sole env reader |
| Module 3 | [Backend Data Flow](./Module%203/Backend%20Data%20Flow) | domain rules as service-layer guards, checks-before-writes workflow |
| Module 3 | [API Design Best Practices](./Module%203/API%20Design%20Best%20Practices) | noun-based routes, `data`/`error` envelopes, pagination metadata, safe errors |

Each solution folder has its own `README.md` explaining **how it was solved**, file by file,
plus how to run and verify it.

---

## How to use a solution

```bash
cd "Module 3/API Design Best Practices"
npm install
npm start
```

Then exercise the endpoints with `curl` or Postman as described in that folder's README.

## Conventions

- Folder path mirrors the starter repo exactly: `Module N/<LU Name>`.
- Every solution README covers: what was wrong / missing in the starter, how each file
  solves it, and how to verify behaviour manually.
- Solutions keep starter constraints (in-memory stores, Express only, no extra frameworks).
