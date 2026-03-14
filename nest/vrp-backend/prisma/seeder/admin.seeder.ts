/* eslint-disable prettier/prettier */
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedAdmin(prisma: PrismaClient, companyId: string) {
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
        },
    });
    console.log(`Admin berhasil ditambah: ${admin.username}`);
}