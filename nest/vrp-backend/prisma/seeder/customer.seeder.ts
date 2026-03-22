/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { Prisma, Role, AccountStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Menggunakan type Prisma.TransactionClient agar seeder ini 
 * bisa dijalankan di dalam blok tx.$transaction yang sudah membuka gerbang RLS.
 */
export async function seedCustomer(tx: Prisma.TransactionClient, companyId: string) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('password123', salt);

    const customer = await tx.user.create({
        data: {
            username: 'pelanggan_siti',
            password: hashedPassword,
            fullName: 'Siti Pembeli',
            phoneNumber: '081122334455',
            birthDate: new Date('2000-08-08'),
            role: Role.CUSTOMER,
            status: AccountStatus.ACCEPTED, // Tambahkan ini agar bisa langsung transaksi
            companyId: companyId,
        },
    });

    console.log(`🛍️ Customer berhasil dibuat: ${customer.username}`);
    return customer; 
}