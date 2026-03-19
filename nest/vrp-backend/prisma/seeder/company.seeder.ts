/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';  

export async function seedCompany(prisma: PrismaClient) {
  // 1. Buat Company
  const company = await prisma.company.create({
    data: {
      name: 'Katering Ibu Budi (SaaS Demo)',
      slug: 'katering-ibu-budi',
      industry: 'F&B',
      tier: 'STARTER',
      maxDepots: 1,
      maxDrivers: 3,
      logoUrl: 'https://dummyimage.com/200x200/e65100/ffffff.png&text=Ibu+Budi',
      colorPrimary: '#E65100',
      colorSecondary: '#FFB300',
    },
  });
  
  console.log(`✅ Company berhasil ditambah: ${company.name}`);

  // 2. TAMBAHAN: Buat Default Delivery Shifts (PENTING untuk Order & Package)
  const shiftPagi = await prisma.deliveryShift.create({
    data: {
      name: 'Shift Pagi (Sarapan)',
      startTime: '07:00',
      endTime: '09:00',
      companyId: company.id,
    }
  });

  const shiftSiang = await prisma.deliveryShift.create({
    data: {
      name: 'Shift Siang (Lunch)',
      startTime: '11:00',
      endTime: '13:00',
      companyId: company.id,
    }
  });

  console.log(`✅ Default Shifts berhasil dibuat: ${shiftPagi.name}, ${shiftSiang.name}`);

  // 3. Buat Owner
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('password123', salt);

  const owner = await prisma.user.create({
    data: {
      username: 'ibu.budi',
      password: hashedPassword,
      fullName: 'Ibu Budi',
      phoneNumber: '081234567890',
      birthDate: new Date('1980-01-01'),
      role: 'OWNER',
      companyId: company.id, 
    },
  });
  
  console.log(`✅ Owner berhasil ditambah: ${owner.username}`);

  // Return semua data agar bisa dipakai di main seed.ts
  return { 
    id: company.id,
    company, 
    owner, 
    shifts: { pagi: shiftPagi, siang: shiftSiang } 
  };
}