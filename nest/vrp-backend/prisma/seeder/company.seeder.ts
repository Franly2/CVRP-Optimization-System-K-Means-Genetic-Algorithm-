/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Prisma, PlanTier, Role, AccountStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';  
import { randomUUID } from 'crypto';

export async function seedCompany(tx: Prisma.TransactionClient) {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('password123', salt);

  // ==========================================
  // 1. BUAT COMPANY A (IBU BUDI)
  // ==========================================
  const idA = randomUUID();
  // Buka gerbang RLS untuk Company A
  await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${idA}';`);

  const companyA = await tx.company.create({
    data: {
      id: idA,
      name: 'Katering Ibu Budi (SaaS Demo)',
      slug: 'katering-ibu-budi',
      industry: 'F&B',
      tier: PlanTier.STARTER,
      logoUrl: 'https://dummyimage.com/200x200/e65100/ffffff.png&text=Ibu+Budi',
      colorPrimary: '#E65100',
    },
  });

  const shiftPagiA = await tx.deliveryShift.create({
    data: { name: 'Pagi A', startTime: '07:00', endTime: '09:00', companyId: idA }
  });
  const shiftSiangA = await tx.deliveryShift.create({
    data: { name: 'Siang A', startTime: '11:00', endTime: '13:00', companyId: idA }
  });

  await tx.user.create({
    data: {
      username: 'ibu.budi',
      password: hashedPassword,
      fullName: 'Ibu Budi',
      phoneNumber: '081234567890',
      birthDate: new Date('1980-01-01'),
      role: Role.OWNER,
      status: AccountStatus.ACCEPTED,
      companyId: idA, 
    },
  });

  console.log(`✅ Company A Created: ${companyA.name}`);

  // ==========================================
  // 2. BUAT COMPANY B (BAPAK AGUS) - BARU!
  // ==========================================
  const idB = randomUUID();
  // PINDAH Gerbang RLS ke Company B
  await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${idB}';`);

  const companyB = await tx.company.create({
    data: {
      id: idB,
      name: 'Katering Bapak Agus (Competitor)',
      slug: 'katering-bapak-agus',
      industry: 'F&B',
      tier: PlanTier.STARTER,
      logoUrl: 'https://dummyimage.com/200x200/1a237e/ffffff.png&text=Pak+Agus',
      colorPrimary: '#1A237E',
    },
  });

  await tx.deliveryShift.create({
    data: { name: 'Shift Tunggal B', startTime: '08:00', endTime: '17:00', companyId: idB }
  });

  await tx.user.create({
    data: {
      username: 'pak.agus',
      password: hashedPassword,
      fullName: 'Bapak Agus',
      phoneNumber: '08999888777',
      birthDate: new Date('1975-05-05'),
      role: Role.OWNER,
      status: AccountStatus.ACCEPTED,
      companyId: idB, 
    },
  });

  console.log(`✅ Company B Created: ${companyB.name}`);

  // Kembali ke sesi A agar seeder selanjutnya (Depot, Product, dll) masuk ke Company A
  await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${idA}';`);

  return { 
    id: idA, // Tetap return ID A agar seeder utama lanjut mengisi data Ibu Budi
    company: companyA, 
    shifts: { pagi: shiftPagiA, siang: shiftSiangA } 
  };
}