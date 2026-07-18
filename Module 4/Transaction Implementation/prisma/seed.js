const prisma = require('../src/db/prisma');

async function main() {
  await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'Sample product', stock: 100 },
  });

  // Keep the generated-id sequence ahead of the explicit seed id.
  await prisma.$executeRawUnsafe(
    'SELECT setval(pg_get_serial_sequence(\'"Product"\', \'id\'), COALESCE((SELECT MAX(id) FROM "Product"), 1), true)'
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
