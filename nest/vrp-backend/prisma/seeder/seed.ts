/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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

  // SEMUA harus masuk ke dalam transaction
  await prisma.$transaction(async (tx) => {
    
    // 1. Jalankan Seed Company pertama kali untuk mendapatkan ID
    // Pastikan seedCompany sudah menggunakan tx di dalamnya
    const companyData = await seedCompany(tx as any); 
    const companyId = companyData.id;

    // 2. BUKA GERBANG RLS (Kunci Utama)
    // Tanpa ini, semua insert ke tabel anak akan FAIL
    await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${companyId}';`);
    console.log(`🔓 Gerbang RLS dibuka untuk Company: ${companyData.company.name}`);

    // 3. Jalankan Seeder pendukung secara berurutan
    const depot = await seedDepot(tx as any, companyId); 
    
    await seedAdmin(tx as any, companyId, depot.id);
    await seedDriver(tx as any, companyId, depot.id);
    
    const customer = await seedCustomer(tx as any, companyId);
    
    const products = await seedProduct(
        tx as any, 
        companyId, 
        companyData.shifts.pagi.id, 
        companyData.shifts.siang.id
    );

    // 4. Buat Transaksi (Order) 
    const orders = await seedOrder(
        tx as any, 
        companyId, 
        customer.id, 
        products, 
        depot.id, 
        companyData.shifts.pagi.id
    ); 

    // 5. Buat Logistik (Package)
    await seedPackage(
        tx as any, 
        companyId, 
        orders, 
        depot.id, 
        companyData.shifts.pagi.id
    );

  }, {
    timeout: 30000 // Berikan timeout lebih lama (30 detik) karena ada 50+ insert
  });

  console.log('✅ DATABASE SIAP DAN TERISOLASI RLS');
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