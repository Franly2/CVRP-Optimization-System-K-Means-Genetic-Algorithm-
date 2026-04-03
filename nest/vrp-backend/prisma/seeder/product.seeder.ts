/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import { Prisma } from '@prisma/client';

export async function seedProduct(
  tx: Prisma.TransactionClient, 
  companyId: string, 
  shiftPagiId: string, 
  shiftSiangId: string,
  depotId: string // 👈 1. Tambahkan parameter depotId di sini
) {
  const product1 = await tx.product.create({
    data: {
      name: 'Nasi Kotak Ayam Bakar',
      price: 25000,
      weightEst: 0.5,
      volumeEst: 1.0,
      companyId: companyId,
      availableShifts: {
        connect: [{ id: shiftPagiId }, { id: shiftSiangId }] 
      },
      // 👇 2. WAJIB: Hubungkan produk ini ke Depot
      availableAt: {
        connect: [{ id: depotId }]
      },
      images: {
        create: [
          { 
            url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', 
            isMain: true, 
            order: 0,
            companyId: companyId 
          }
        ]
      }
    },
  });

  const product2 = await tx.product.create({
    data: {
      name: 'Nasi Kotak Rendang Daging',
      price: 30000,
      weightEst: 0.6,
      volumeEst: 1.0,
      companyId: companyId,
      availableShifts: {
        connect: [{ id: shiftSiangId }] 
      },
      // 👇 3. WAJIB: Hubungkan produk ini ke Depot
      availableAt: {
        connect: [{ id: depotId }]
      },
      images: {
        create: [
          { 
            url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', 
            isMain: true, 
            order: 0,
            companyId: companyId 
          }
        ]
      }
    },
  });

  console.log(`🍱 Produk berhasil dibuat: ${product1.name} & ${product2.name}`);
  return [product1, product2];
}