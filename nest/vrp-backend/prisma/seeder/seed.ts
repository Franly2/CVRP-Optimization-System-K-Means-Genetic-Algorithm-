/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client';
import { seedCompany } from './company.seeder';
import { seedAdmin } from './admin.seeder';
import { seedDriver } from './driver.seeder';
import { seedDepot } from './depot.seeder';
import { seedCustomer } from './customer.seeder';
import { seedProduct } from './product.seeder';
import { seedOrder } from './order.seeder';
import { seedPackage } from './package.seeder';

const prisma = new PrismaClient();

async function main() {
  const company = await seedCompany(prisma);
  const depot = await seedDepot(prisma, company.id); 
  
  await seedAdmin(prisma, company.id, depot.id);
  await seedDriver(prisma, company.id, depot.id);
  const customer = await seedCustomer(prisma, company.id);
  const products = await seedProduct(prisma, company.id, company.shifts.pagi.id, company.shifts.siang.id);

  // Buat Transaksi (Order) - Tanpa perlu tahu soal Depot
  const orders = await seedOrder(prisma, company.id, customer.id, products, depot.id, company.shifts.pagi.id); 

  // // Buat Logistik (Package) - disini baru hubungin ke Depot
  await seedPackage(prisma, company.id, orders, depot.id, company.shifts.pagi.id);

  console.log('DATABASE SIAP');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error saat seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });