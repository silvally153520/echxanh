import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'sieuechxanh Admin';

  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD before running db:seed.');
  }
  if (password.length < 8 || password.startsWith('replace-with-')) {
    throw new Error('Set a non-placeholder ADMIN_PASSWORD with at least 8 characters.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.upsert({
    where: { email },
    create: { email, passwordHash, name, role: 'ADMIN' },
    update: { role: 'ADMIN', isBanned: false },
    select: { id: true, email: true, role: true },
  });

  console.info(`Admin account ready: ${admin.email} (${admin.id})`);
};

seedAdmin()
  .catch(error => {
    console.error('Failed to seed admin account:', error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
