# Repository Pattern Assignment Solution

The service depends on a stable repository contract. Storage is private to `src/repositories/postRepository.js`; replacing its internal array with a Map or Prisma adapter does not require service or controller changes.

The repository owns ID generation, returns a copy from `findAll`, and uses `null` or `false` for missing records according to each method contract.
