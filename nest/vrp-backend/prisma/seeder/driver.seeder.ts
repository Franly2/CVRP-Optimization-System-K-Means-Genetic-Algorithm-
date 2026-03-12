/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedDrivers(prisma: PrismaClient) {
  console.log('Menambahkan 20 akun Kurir...');
  
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync('password123', salt);
  
  const dummyDrivers = [];
  
  for (let i = 1; i <= 20; i++) {
    const usernameFormat = `driver${i.toString().padStart(2, '0')}`;
    // const randomCapacity = Math.floor(Math.random() * (35 - 15 + 1)) + 15;
    const randomCapacity = 10; // buat tes
    dummyDrivers.push({
      username: usernameFormat,
      password: hashedPassword,
      fullName: `Kurir Dummy ${i}`,
      phoneNumber: `0812345678${i.toString().padStart(2, '0')}`,
      birthDate: new Date(1995, 5, 15),
      role: Role.DRIVER,
      maxCapacity: randomCapacity,
    });
  }

  const driverResult = await prisma.user.createMany({
    data: dummyDrivers,
    skipDuplicates: true, 
  });
  console.log(`Berhasil menambahkan ${driverResult.count} Kurir baru!`);
}