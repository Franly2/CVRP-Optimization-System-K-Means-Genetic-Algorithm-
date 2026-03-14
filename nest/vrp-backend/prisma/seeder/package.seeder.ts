/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { PrismaClient } from '@prisma/client';

export async function seedPackage(
  prisma: PrismaClient,
  companyId: string,
  ordersData: any[], // <--  array dari Order
  depotId: string,
) {
  console.log('⏳ Sedang memproses 50 Package ke Logistik...');

  for (const orderData of ordersData) {
    const productInfo = orderData.items[0].product;
    const totalWeight = productInfo.weightEst * orderData.items[0].quantity;
    const totalVolume = productInfo.volumeEst * orderData.items[0].quantity;

    const pkg = await prisma.package.create({
      data: {
        companyId: companyId,
        depotId: depotId, 
        recipientName: `Penerima Order ${orderData.id.substring(0, 5)}`,
        address: orderData.deliveryAddress,
        lat: orderData.destLat,
        lng: orderData.destLng,
        
        weight: totalWeight,
        volume: totalVolume,
        
        refOrderId: orderData.id,
        
        metadata: {
          pesanan: `${orderData.items[0].quantity}x ${productInfo.name}`,
          catatan: 'Dummy pengiriman untuk algoritma rute K-Means',
        },
      },
    });

    // handshake (isi trackingId di Order dengan ID Package)
    await prisma.order.update({
      where: { id: orderData.id },
      data: { trackingId: pkg.id },
    });
  }

  console.log(`50 Package Logistik berhasil dibuat dan resi terhubung!`);
}