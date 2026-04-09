/* eslint-disable prettier/prettier */
  /* eslint-disable prettier/prettier */
  /* eslint-disable prettier/prettier */
  /* eslint-disable @typescript-eslint/no-unsafe-argument */
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
    console.log('🌱 Memulai proses Seeding dengan pengamanan RLS...');

    await prisma.$transaction(async (tx) => {
      
      const companyData = await seedCompany(tx as any); 
      const companyId = companyData.id;

      await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${companyId}';`);
      console.log(`🔓 Gerbang RLS dibuka untuk Company: ${companyData.company.name}`);

      const depot = await seedDepot(tx as any, companyId); 
      
      await seedAdmin(tx as any, companyId, depot.id);
      await seedDriver(tx as any, companyId, depot.id);
      
      const customers = await seedCustomer(tx as any, companyId);
      
      const products = await seedProduct(
          tx as any, 
          companyId, 
          companyData.shifts.pagi.id, 
          companyData.shifts.siang.id,
          depot.id
      );

      const orders = await seedOrder(
          tx as any, 
          companyId, 
          customers, 
          products, 
          depot.id, 
          companyData.shifts.pagi.id
      ); 

      await seedPackage(
          tx as any, 
          companyId, 
          orders, 
          depot.id, 
          companyData.shifts.pagi.id
      );

    }, {
      timeout: 30000 //  timeout 30s karena ada 50+ insert
    });

    console.log('✅ DATABASE SEED SUCCESS');
  }

  main()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error('❌ Error saat seeding:', e);
      await prisma.$disconnect();
      process.exit(1);
    });