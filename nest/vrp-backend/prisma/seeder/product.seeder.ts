/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { Prisma } from '@prisma/client';

export async function seedProduct(
  tx: Prisma.TransactionClient, // 👈 Gunakan TransactionClient
  companyId: string, 
  shiftPagiId: string, 
  shiftSiangId: string 
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
      images: {
        create: [
          { 
            url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', 
            isMain: true, 
            order: 0,
            companyId: companyId // 👈 WAJIB: Agar ProductImage lolos RLS
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
      images: {
        create: [
          { 
            url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', 
            isMain: true, 
            order: 0,
            companyId: companyId // 👈 WAJIB
          }
        ]
      }
    },
  });

  console.log(`🍱 Produk berhasil dibuat: ${product1.name} & ${product2.name}`);
  return [product1, product2];
}