/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
// prisma/seeder/package.seeder.ts
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { PrismaClient, OrderStatus } from '@prisma/client';

export async function seedOrder(
  prisma: PrismaClient,
  companyId: string,
  customerId: string,
  products: any[],
  depotId: string

) {
  const createdOrders = [];

  console.log('⏳ Sedang men-generate 50 Order (Mohon tunggu)...');

  for (let i = 1; i <= 50; i++) {
    // Generate Random Kordinat Area Surabaya
    // Base Lat Surabaya: -7.2000 s/d -7.3500
    // Base Lng Surabaya: 112.6500 s/d 112.8000
    const randomLat = -7.2 + (Math.random() * -0.15);
    const randomLng = 112.65 + (Math.random() * 0.15);

    const order = await prisma.order.create({
      data: {
        companyId: companyId,
        depotId: depotId,
        customerId: customerId,
        totalPrice: products[0].price * 2,
        status: OrderStatus.PAID,
        
        deliveryAddress: `Rumah Pelanggan No. ${i}, Jalan Dummy Surabaya`,
        destLat: randomLat,
        destLng: randomLng, 
        
        items: {
          create: [
            {
              productId: products[0].id,
              quantity: 2,
              priceAtBuy: products[0].price,
            },
          ],
        },
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    createdOrders.push(order);
  }
  
  console.log(`🛒 50 Order Katering berhasil dibuat dengan kordinat tersebar!`);
  return createdOrders; // Kembalikan ARRAY isi 50 order
}