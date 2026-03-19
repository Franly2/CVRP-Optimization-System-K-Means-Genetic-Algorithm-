/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client';

export async function seedProduct(
  prisma: PrismaClient, 
  companyId: string, 
  shiftPagiId: string, // 👈 Tambahkan parameter shift
  shiftSiangId: string // 👈 Tambahkan parameter shift
) {
  const product1 = await prisma.product.create({
    data: {
      name: 'Nasi Kotak Ayam Bakar',
      price: 25000,
      weightEst: 0.5,
      volumeEst: 1.0,
      companyId: companyId,
      // 👇 Hubungkan produk ke shift (Many-to-Many)
      availableShifts: {
        connect: [{ id: shiftPagiId }, { id: shiftSiangId }] // Bisa dipesan pagi & siang
      },
      // 👇 Tambahkan foto dummy (opsional tapi bagus untuk UI)
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', isMain: true, order: 0 }
        ]
      }
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Nasi Kotak Rendang Daging',
      price: 30000,
      weightEst: 0.6,
      volumeEst: 1.0,
      companyId: companyId,
      // 👇 Hubungkan hanya ke shift siang
      availableShifts: {
        connect: [{ id: shiftSiangId }] 
      },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', isMain: true, order: 0 }
        ]
      }
    },
  });

  console.log(`🍱 Produk berhasil dibuat: ${product1.name} & ${product2.name}`);
  return [product1, product2];
}