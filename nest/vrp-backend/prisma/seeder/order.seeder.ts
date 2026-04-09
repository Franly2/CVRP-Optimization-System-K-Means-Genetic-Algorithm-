/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Prisma, OrderStatus } from '@prisma/client';

export async function seedOrder(
  tx: Prisma.TransactionClient, 
  companyId: string,
  customers: any[], 
  products: any[],
  depotId: string,
  deliveryShiftId: string
) {
  const createdOrders = [];

  console.log('⏳ Sedang men-generate 50 Order (Mohon tunggu)...');

  for (let i = 1; i <= 50; i++) {
    const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
    const customerMainAddressId = randomCustomer.addresses[0].id;

    const order = await tx.order.create({
      data: {
        companyId: companyId,
        depotId: depotId,
        customerId: randomCustomer.id, 
        totalPrice: products[0].price * 2,
        status: OrderStatus.PAID,
        deliveryShiftId: deliveryShiftId, 

        addressId: customerMainAddressId, 
        
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
        },
        address: true 
      }
    });

    createdOrders.push(order);
  }
  
  console.log(`🛒 50 Order Katering berhasil disebar ke 10 pelanggan!`);
  return createdOrders; 
}