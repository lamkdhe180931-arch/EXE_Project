// Seed an ADMIN user — `register` only ever makes CUSTOMER accounts, so this is
// the supported way to bootstrap the admin who logs into the admin panel.
// Run: `npm run db:seed` (needs ADMIN_EMAIL + ADMIN_PASSWORD in env + a real DB).
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('Cần ADMIN_EMAIL và ADMIN_PASSWORD trong .env để seed admin');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  // Idempotent: re-running promotes/repairs the same account instead of failing.
  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN', passwordHash },
    create: { email, name: 'Artdict Admin', role: 'ADMIN', passwordHash },
  });

  console.log(`✓ Admin sẵn sàng: ${admin.email} (role=${admin.role})`);
}

main()
  .catch((e) => {
    console.error('Seed admin thất bại:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
