/* eslint-disable prettier/prettier */
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedCustomer(prisma: PrismaClient, companyId: string) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('password123', salt);
  const customer = await prisma.user.create({
    data: {
      username: 'pelanggan_siti',
      password: hashedPassword,
      fullName: 'Siti Pembeli',
      phoneNumber: '081122334455',
      birthDate: new Date('2000-08-08'),
      role: Role.CUSTOMER,
      companyId: companyId,
    },
  });
  console.log(`🛍️ Customer berhasil dibuat: ${customer.username}`);
  return customer; // balikin objek customer untuk diambil ID-nya
}