# Database Integration Assignment Solution

Prisma-backed implementation of the asynchronous repository contract.

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:format
npm run prisma:validate
npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed
npm start
```

Use a disposable PostgreSQL database for local work. Never commit `.env` or real credentials.

`src/db/prisma.js` owns one PrismaClient instance. Prisma access stays inside repositories. Services and controllers retain the application contract established before the database swap.
