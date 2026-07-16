# Supporting Layers — Solution

Reference solution for the "untangle a scattered Express API" assignment. Behaviour is identical to the starter; only structure changed.

## How This Was Solved

### 1. `validators/article.validator.js`
The inline `body(...)` chains moved out of the route file into named exports `createArticle` and `updateArticle`. Routes import chains; validation logic has one home.

### 2. `utils/AppError.js`
The class was defined twice (service + error handler). Now defined once, imported everywhere. One change point for operational errors.

### 3. `utils/asyncHandler.js`
```javascript
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```
Controllers dropped all try/catch boilerplate — rejected promises flow to the central error handler.

### 4. `utils/validateRequest.js`
The inline `validationResult` check from the route file became a shared middleware returning a structured `422`.

### 5. `config/index.js`
The **only** file reading `process.env`. Exports `{ port, nodeEnv, jwtSecret, maxArticles }` with defaults. `app.js`, the service, and the error handler now import config instead of touching env directly.

### 6. `.env.example` + `.gitignore`
`.env.example` is committed and lists every variable; `.env` stays ignored.

## Self-Audit Passes

```bash
grep -rn "process.env" . | grep -v node_modules
# → only config/index.js
```

## Run

```bash
npm install
npm start
curl -X POST http://localhost:3000/articles -H "Content-Type: application/json" -d '{"title":"Hi","body":"Text"}'
```
