/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Prisma } from '@prisma/client'; // Import Prisma untuk tipe Transaction

/**
 * Ganti 'prisma: PrismaClient' menjadi 'tx: Prisma.TransactionClient'
 */
export async function seedDepot(tx: Prisma.TransactionClient, companyId: string) {
  // Gunakan 'tx' bukan 'prisma'
  const depot = await tx.depot.create({
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