/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AddAdminDto } from './dto/addAdmin.dto';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { addDriverDto } from './dto/addDriver.dto';
import { AccountStatus, Role } from '@prisma/client';

@Injectable()
export class HumanService {
    constructor(private readonly prisma: PrismaService) {}
    
    async createAdmin(companyId: string, data: AddAdminDto) {
    try {
      const result = await this.prisma.withTenant(companyId, async (tx) => {
        
        const existingUser = await tx.user.findFirst({
          where: { username: data.username }
        });
        if (existingUser) throw new BadRequestException('Username sudah terdaftar');

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newAdmin = await tx.user.create({
          data: {
            username: data.username,
            password: hashedPassword,
            fullName: data.fullName,
            role: 'ADMIN',       
            status: AccountStatus.ACCEPTED,
            companyId: companyId, 
            depotId: data.depotId, 
            phoneNumber: data.phoneNumber,         
            birthDate: new Date(data.birthDate),
          },
        });

        const { password, ...adminWithoutPassword } = newAdmin;
        
        return {
          status: 'success',
          message: 'Admin Depot berhasil ditambahkan',
          data: adminWithoutPassword,
        };
      });

      return result;

    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.error('Error creating admin:', error);
      throw new InternalServerErrorException('Gagal menambah admin');
    }
  }

   async createDriver(dto: addDriverDto, role: string, companyId: string) {
    return this.prisma.withTenant(companyId, async (tx) => {
      
      const depot = await tx.depot.findUnique({
        where: { id: dto.depotId },
      });

      if (!depot) {
        throw new NotFoundException('Depot tidak ditemukan. Driver wajib memiliki pangkalan.');
      }

      const existingUser = await tx.user.findFirst({
        where: { 
          username: dto.username,
        },
      });

      if (existingUser) {
        throw new BadRequestException('Username sudah terdaftar di perusahaan ini.');
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(dto.password, salt);

      const finalStatus = role === Role.OWNER 
        ? AccountStatus.ACCEPTED 
        : AccountStatus.PENDING;

      return tx.user.create({
        data: {
          username: dto.username,
          password: hashedPassword,
          fullName: dto.fullName, 
          phoneNumber: dto.phoneNumber,
          birthDate: new Date(dto.birthDate),
          role: Role.DRIVER,
          companyId: companyId,
          depotId: dto.depotId,
          status: finalStatus,

          vehicle: {
            create: {
              type: dto.vehicleType,
              plateNumber: dto.plateNumber,
              model: dto.vehicleModel,
              maxWeight: dto.maxWeight,
              maxVolume: dto.maxVolume,
              companyId: companyId
            },
          },

          driverLocation: {
            create: {
              lat: depot.lat,
              lng: depot.lng,
              companyId: companyId
            },
          },
        },
        include: {
          vehicle: true,
          driverLocation: true, 
        },
      });
      
    });
}

  async acceptDriver(companyId: string, userId: string) {
    return this.prisma.withTenant(companyId, async (tx) => {
      
      const user = await tx.user.findUnique({ 
        where: { id: userId } 
      });
      
      if (!user) {
        throw new NotFoundException('User tidak ditemukan atau bukan dari perusahaan Anda');
      }

      return tx.user.update({
        where: { id: userId },
        data: { status: AccountStatus.ACCEPTED },
      });
      
    });
  }

  async changeStatusEmployee(companyId: string, userId: string, status: AccountStatus) {
    return this.prisma.withTenant(companyId, async (tx) => {
      const user = await tx.user.findUnique({ 
        where: { id: userId } 
      });
      
      if (!user) {
        throw new NotFoundException('Karyawan tidak ditemukan!');
      }

      return tx.user.update({
        where: { id: userId },
        data: { status },
        select: {
          id: true,
          fullName: true,
          role: true,
          status: true, 
        }
      });
      
    });
  }

 async getStaffById(staffId: string, companyId: string) {
  const result = await this.prisma.withTenant(companyId, async (tx) => {
    const staff = await tx.user.findFirst({
      where: {
        id: staffId,
        companyId: companyId,
      },
      include: {
        depot: true,
        vehicle: true,
        driverLocation: true,
        routes: {
          orderBy: { date: 'desc' },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
        },
        subscriptions: true,
        cartItems: true,
      },
    });

    if (!staff) {
      throw new NotFoundException('Data staf tidak ditemukan di perusahaan ini.');
    }

    const { password, ...staffWithoutPassword } = staff;
    return staffWithoutPassword;
  });

  return {
    message: 'Berhasil mengambil detail staf',
    data: result,
  };
}
}
