/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
// prisma/seeder/package.seeder.ts
import { PrismaClient } from '@prisma/client';

const MIN_LAT = -7.35;
const MAX_LAT = -7.20;
const MIN_LNG = 112.65;
const MAX_LNG = 112.80;

function getRandomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export async function seedPackages(prisma: PrismaClient) {
  console.log('Menambahkan 100 paket di area Surabaya...');
  
  const dummyPackages = [];

  for (let i = 1; i <= 100; i++) {
    dummyPackages.push({
      recipientName: `Pelanggan Dummy ${i}`,
      address: `Jl. Simulasi Surabaya No. ${i}`,
      lat: getRandomInRange(MIN_LAT, MAX_LAT),
      lng: getRandomInRange(MIN_LNG, MAX_LNG),
      // weight: parseFloat((Math.random() * (10 - 1) + 1).toFixed(1)), 
      weight: 1, // Set semua berat jadi 1 kg untuk testing clustering
      // volume: parseFloat((Math.random() * (20 - 5) + 5).toFixed(1)),
      volume: 1, // Set semua volume jadi 1 unit untuk testing clustering
    });
  }

  const packageResult = await prisma.package.createMany({
    data: dummyPackages,
  });
  console.log(`Berhasil menambahkan ${packageResult.count} paket baru!`);
}