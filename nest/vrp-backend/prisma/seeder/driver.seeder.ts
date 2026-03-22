/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Prisma, Role, AccountStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedDriver(
  tx: Prisma.TransactionClient, // 👈 Ganti ke TransactionClient
  companyId: string, 
  depotId: string 
) {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync('password123', salt);

  const driversData = [
    { name: 'Budi Santoso', phone: '081200000001' },
    { name: 'Siti Aminah', phone: '081200000002' },
    { name: 'Agus Prayitno', phone: '081200000003' },
    { name: 'Dewi Lestari', phone: '081200000004' },
    { name: 'Eko Wijaya', phone: '081200000005' },
    { name: 'Rina Permata', phone: '081200000006' },
    { name: 'Andi Saputra', phone: '081200000007' },
    { name: 'Maya Indah', phone: '081200000008' },
    { name: 'Fajar Ramadhan', phone: '081200000009' },
    { name: 'Gita Savitri', phone: '081200000010' },
  ];

  console.log('🚀 Memulai proses seeding 10 driver...');

  for (let i = 0; i < driversData.length; i++) {
    const data = driversData[i];
    const identifier = i + 1;

    // Gunakan tx untuk menembus RLS
    await tx.user.create({
      data: {
        username: `driver_kurir_${identifier}`,
        password: hashedPassword,
        fullName: data.name,
        phoneNumber: data.phone,
        birthDate: new Date('1990-01-01'),
        role: Role.DRIVER,
        status: AccountStatus.ACCEPTED, // 👈 Tambahkan agar driver bisa langsung login ke mobile app
        companyId: companyId,
        depotId: depotId,
        vehicle: {
          create: {
            plateNumber: `L ${1230 + identifier} ABC`, 
            model: identifier % 2 === 0 ? 'Honda Vario' : 'Yamaha Lexi',
            maxWeight: 60.0, 
            maxVolume: 120.0,
            companyId: companyId, // 👈 WAJIB: Vehicle juga harus punya companyId agar lolos RLS
          },
        },
      },
    });
  }

  console.log('✅ Berhasil membuat 10 akun kurir dengan 10 kendaraan berbeda.');
}