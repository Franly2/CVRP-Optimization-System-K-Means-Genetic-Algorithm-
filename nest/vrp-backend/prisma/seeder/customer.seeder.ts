/* eslint-disable prettier/prettier */
import { Prisma, Role, AccountStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedCustomer(tx: Prisma.TransactionClient, companyId: string) {
    const createdCustomers = [];
    console.log('⏳ Sedang men-generate 10 Customer dengan koordinat tersebar...');

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('password123', salt);

    const centerLat = -7.2756;
    const centerLng = 112.7562;

    for (let i = 1; i <= 10; i++) {
        // Generate koordinat acak di sekitar Surabaya (radius ~5-10km)
        const randomLat = centerLat + (Math.random() - 0.5) * 0.1;
        const randomLng = centerLng + (Math.random() - 0.5) * 0.1;

        const customer = await tx.user.create({
            data: {
                username: `pelanggan_${i}`, // pelanggan_1, pelanggan_2, dst
                password: hashedPassword,
                fullName: `Pelanggan Dummy Ke-${i}`,
                phoneNumber: `0811223344${i.toString().padStart(2, '0')}`,
                birthDate: new Date('2000-08-08'),
                role: Role.CUSTOMER,
                status: AccountStatus.ACCEPTED, 
                companyId: companyId,
                
                addresses: {
                    create: [
                        {
                            label: 'Rumah Utama',
                            addressLine: `Jalan Kenjeran No. ${100 + i}, Surabaya`,
                            latitude: randomLat,
                            longitude: randomLng,
                            isMain: true,
                        }
                    ]
                }
            },
            include: {
                addresses: true,
            }
        });

        createdCustomers.push(customer);
    }

    console.log(`🛍️ 10 Customer berhasil dibuat dengan data koordinat yang menyebar!`);
    
    return createdCustomers; 
}