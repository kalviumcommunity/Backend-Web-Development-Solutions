# Transaction Implementation Assignment Solution

Prisma transactions for multi-step writes, showing both forms and a forced-rollback proof.

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed
npm start
```

Use a disposable PostgreSQL database. Never commit `.env` or real credentials.

`src/repositories/orderRepository.js` contains:

- `placeOrderArray` — array form for the independent order + stock writes.
- `placeOrderInteractive` — interactive form where the ledger entry needs the new order id.
- `forcedRollbackDemo` — throws inside a transaction and confirms nothing persisted.

Services and controllers contain no transaction mechanics.
