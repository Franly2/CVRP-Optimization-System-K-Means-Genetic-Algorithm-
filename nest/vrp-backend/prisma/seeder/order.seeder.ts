/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Prisma, OrderStatus } from '@prisma/client';

export async function seedOrder(
  tx: Prisma.TransactionClient, // 👈 Gunakan TransactionClient
  companyId: string,
  customerId: string,
  products: any[],
  depotId: string,
  deliveryShiftId: string
) {
  const createdOrders = [];

  console.log('⏳ Sedang men-generate 50 Order (Mohon tunggu)...');

  for (let i = 1; i <= 50; i++) {
    // Generate Random Kordinat Area Surabaya (Penting untuk Clustering)
    const randomLat = -7.2 + (Math.random() * -0.15);
    const randomLng = 112.65 + (Math.random() * 0.15);

    const order = await tx.order.create({
      data: {
        companyId: companyId,
        depotId: depotId,
        customerId: customerId,
        totalPrice: products[0].price * 2,
        status: OrderStatus.PAID,
        deliveryShiftId: deliveryShiftId, 

        deliveryAddress: `Rumah Pelanggan No. ${i}, Jalan Dummy Surabaya`,
        destLat: randomLat,
        destLng: randomLng, 
        
        items: {
          create: [
            {
              productId: products[0].id,
              quantity: 2,
              priceAtBuy: products[0].price,
              companyId: companyId, 
            },
          ],
        },
      },
      include: {
        items: {
          include: {
            product: true 
          }
        }
      }
    });

    createdOrders.push(order);
  }
  
  console.log(`🛒 50 Order Katering berhasil dibuat dengan kordinat tersebar!`);
  return createdOrders; 
}