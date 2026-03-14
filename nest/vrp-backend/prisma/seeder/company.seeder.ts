/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client';

export async function seedCompany(prisma: PrismaClient) {
  const company = await prisma.company.create({
    data: {
      name: 'Katering Ibu Budi (SaaS Demo)',
      industry: 'F&B',
    },
  });
  console.log(`Company berhasil ditambah: ${company.name}`);
  return company; // balikin objek company untuk diambil ID-nya
}