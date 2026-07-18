const { PrismaClient } = require('@prisma/client');

// One database client is shared by repositories in this Node process.
const prisma = new PrismaClient();

module.exports = prisma;
