const prisma = require('../src/db/prisma');

async function main() {
  const user = await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'Demo User' },
  });

  await prisma.post.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: 'First post',
      body: 'The repository contract survived the database swap.',
      authorId: user.id,
    },
  });

  // Keep PostgreSQL's generated-ID sequence ahead of explicit seed IDs.
  await prisma.$executeRawUnsafe(
    'SELECT setval(pg_get_serial_sequence(\'"Post"\', \'id\'), COALESCE((SELECT MAX(id) FROM "Post"), 1), true)'
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
