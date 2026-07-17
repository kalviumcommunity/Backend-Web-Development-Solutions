# Repository Pattern Assignment Solution

Reference implementation for the repository-boundary refactor.

## Run

```bash
npm start
```

`src/repositories/postRepository.js` owns the private in-memory store, ID generation, and five-method contract. `postService.js` depends only on that contract. Controllers remain unchanged.

The repository can be replaced by an array, Map, or Prisma-backed implementation without changing the service contract.
