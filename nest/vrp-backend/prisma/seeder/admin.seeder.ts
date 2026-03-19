/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedAdmin(prisma: PrismaClient, companyId: string, depotId: string) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('password123', salt);
    
    const admin = await prisma.user.create({
        data: {
            username: 'admin_budi',
            password: hashedPassword, 
            fullName: 'Budi Santoso',
            phoneNumber: '081234567890',
            birthDate: new Date('1990-01-01'),
            role: Role.ADMIN,
            companyId: companyId,
            depotId: depotId
        },
    });

    console.log(`✅ Admin berhasil ditambah: ${admin.username}`);
    return admin; // Kembalikan objek admin
}