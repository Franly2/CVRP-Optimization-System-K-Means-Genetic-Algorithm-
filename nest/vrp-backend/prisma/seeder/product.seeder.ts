/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client';

export async function seedProduct(prisma: PrismaClient, companyId: string) {
  const product1 = await prisma.product.create({
    data: {
      name: 'Nasi Kotak Ayam Bakar',
      price: 25000,
      weightEst: 0.5,
      volumeEst: 1.0,
      companyId: companyId,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Nasi Kotak Rendang Daging',
      price: 30000,
      weightEst: 0.6,
      volumeEst: 1.0,
      companyId: companyId,
    },
  });
  console.log(`🍱 Produk berhasil dibuat: ${product1.name} & ${product2.name}`);
  return [product1, product2]; // Kembalikan array produk untuk diambil ID-nya
}