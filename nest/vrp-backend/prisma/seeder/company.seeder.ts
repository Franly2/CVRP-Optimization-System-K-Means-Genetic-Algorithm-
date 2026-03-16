/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';  

export async function seedCompany(prisma: PrismaClient) {
  const company = await prisma.company.create({
    data: {
      name: 'Katering Ibu Budi (SaaS Demo)',
      slug: 'katering-ibu-budi', // untuk URL
      industry: 'F&B',
      tier: 'STARTER',
      maxDepots: 1,
      maxDrivers: 3,
      
      logoUrl: 'https://dummyimage.com/200x200/e65100/ffffff.png&text=Ibu+Budi', // Pakai dummy image dulu
      colorPrimary: '#E65100',
      colorSecondary: '#FFB300',
    },
  });
  
  console.log(`✅ Company berhasil ditambah: ${company.name} (Slug: ${company.slug})`);
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('password123', salt);

  const owner = await prisma.user.create({
    data: {
      username: 'ibu.budi',
      password: hashedPassword,
      fullName: 'Ibu Budi',
      phoneNumber: '081234567890',
      birthDate: new Date('1980-01-01'),
      role: 'OWNER',
      companyId: company.id, 
    },
  });
  console.log(`✅ Owner berhasil ditambah: ${owner.username} (Company ID: ${company.id})`);

  return { company, owner };
}