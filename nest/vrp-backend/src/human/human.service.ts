/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AddAdminDto } from './dto/addAdmin.dto';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { addDriverDto } from './dto/addDriver.dto';
import { AccountStatus, Role } from '@prisma/client/wasm';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Injectable()
export class HumanService {
    constructor(private readonly prisma: PrismaService) {}
    
    async createAdmin(companyId: string, data: AddAdminDto) {
    try {
      // 1. Cek apakah username sudah dipakai
      const existingUser = await this.prisma.user.findFirst({
        where: { username: data.username }
      });
      if (existingUser) throw new BadRequestException('Username sudah terdaftar');

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const newAdmin = await this.prisma.user.create({
        data: {
          username: data.username,
          password: hashedPassword,
          fullName: data.fullName,
          role: 'ADMIN',       
          companyId: companyId, 
          depotId: data.depotId, 
          phoneNumber: data.phoneNumber,         
          birthDate: new Date(data.birthDate),
        },
      });

      // Hapus password dari return
      const { password, ...adminWithoutPassword } = newAdmin;
      
      return {
        status: 'success',
        message: 'Admin Depot berhasil ditambahkan',
        data: adminWithoutPassword,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.error(error);
      throw new InternalServerErrorException('Gagal menambah admin');
    }
   }

   async createDriver(dto: addDriverDto, role: string) {
    const depot = await this.prisma.depot.findUnique({
      where: { id: dto.depotId },
    });

    if (!depot) {
      throw new NotFoundException('Depot tidak ditemukan. Driver wajib memiliki pangkalan.');
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { 
        username: dto.username,
        companyId: dto.companyId 
      },
    });

    if (existingUser) {
      throw new BadRequestException('Username sudah terdaftar di perusahaan ini.');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash('password123', salt);

    const finalStatus = role === Role.OWNER 
    ? AccountStatus.ACCEPTED 
    : AccountStatus.PENDING;

    // Insert User + Vehicle + DriverLocation (Default dari Depot)
    return this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        fullName: dto.fullName, 
        phoneNumber: dto.phoneNumber,
        birthDate: new Date(dto.birthDate),
        role: Role.DRIVER,
        companyId: dto.companyId,
        depotId: dto.depotId,
        status: finalStatus,

        vehicle: {
          create: {
            type: dto.vehicleType,
            plateNumber: dto.plateNumber,
            model: dto.vehicleModel,
            maxWeight: dto.maxWeight,
            maxVolume: dto.maxVolume,
          },
        },

        driverLocation: {
          create: {
            lat: depot.lat,
            lng: depot.lng,
          },
        },
      },
      include: {
        vehicle: true,
        driverLocation: true, 
      },
    });
  }

  async acceptDriver(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) throw new NotFoundException('User tidak ditemukan');

    return this.prisma.user.update({
      where: { id: userId },
      data: { status: AccountStatus.ACCEPTED },
    });
  }
}
