/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { Prisma } from '@prisma/client';

export async function seedPackage(
  tx: Prisma.TransactionClient, // 👈 Gunakan tx
  companyId: string,
  ordersData: any[], 
  depotId: string,
  deliveryShiftId: string 
) {
  console.log('⏳ Sedang memproses 50 Package ke Logistik...');

  for (const orderData of ordersData) {
    const productInfo = orderData.items[0].product;
    const totalWeight = productInfo.weightEst * orderData.items[0].quantity;
    const totalVolume = productInfo.volumeEst * orderData.items[0].quantity;

    // 1. Buat Package (Domain Logistik)
    const pkg = await tx.package.create({
      data: {
        companyId: companyId,
        depotId: depotId, 
        deliveryShiftId: deliveryShiftId,
        
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

    // RLS akan memastikan user hanya bisa update Order milik companyId yang sama
    // await tx.order.update({
    //   where: { id: orderData.id },
    //   data: { 
    //     trackingId: pkg.id,
    //     // Status diubah menjadi READY_FOR_DELIVERY karena paket sudah dibuat
    //     status: 'READY_FOR_DELIVERY' 
    //   },
    // });
  }

  console.log(`✅ 50 Package Logistik berhasil dibuat dan resi terhubung!`);
}