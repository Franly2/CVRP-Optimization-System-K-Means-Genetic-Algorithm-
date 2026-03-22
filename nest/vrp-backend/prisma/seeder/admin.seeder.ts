/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { AccountStatus, Prisma, Role } from '@prisma/client'; // Import Prisma untuk tipe data Transaction
import * as bcrypt from 'bcrypt';

/**
 * Ganti parameter 'prisma: PrismaClient' menjadi 'tx: Prisma.TransactionClient'
 */
export async function seedAdmin(tx: Prisma.TransactionClient, companyId: string, depotId: string) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('password123', salt);
    
    // Gunakan 'tx' bukan 'prisma'
    const admin = await tx.user.create({
        data: {
            username: 'admin_budi',
            password: hashedPassword, 
            fullName: 'Budi Santoso',
            phoneNumber: '081234567890',
            birthDate: new Date('1990-01-01'),
            role: Role.ADMIN,
            status: AccountStatus.ACCEPTED,
            companyId: companyId,
            depotId: depotId,
        },
    });

    console.log(`✅ Admin berhasil ditambah: ${admin.username}`);
    return admin; 
}