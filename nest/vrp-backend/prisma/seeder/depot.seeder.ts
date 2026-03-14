/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient } from '@prisma/client';

export async function seedDepot(prisma: PrismaClient, companyId: string) {
  const depot = await prisma.depot.create({
    data: {
      name: 'Gudang Utama Surabaya Pusat',
      lat: -7.3193,
      lng: 112.7386,
      address: 'Jl. Raya Manyar No. 1, Surabaya',
      companyId: companyId,
    },
  });
  console.log(`🏠 Depot berhasil dibuat: ${depot.name}`);
  return depot;
}