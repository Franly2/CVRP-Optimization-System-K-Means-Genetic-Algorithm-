/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-misused-promises */
// prisma/seeder/seed.ts
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { seedDrivers } from './driver.seeder';
import { seedPackages } from './package.seeder';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding Database...');

  await seedDrivers(prisma);
  await seedPackages(prisma);

  console.log('Semua proses Seeding Selesai!');
}

main()
  .catch((e) => {
    console.error('Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });