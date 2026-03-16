/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AddDepotDto } from './dto/addDepot.dto';
import { AddAdminDto } from './dto/addAdmin.dto';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { AddProductDto } from './dto/addProduct.dto';

@Injectable()
export class TenantService {
    constructor(private readonly prisma: PrismaService) {}
    
    async createDepot(companyId: string, data: AddDepotDto) {
    try{
        const newDepot = await this.prisma.depot.create({
        data: {
            name: data.name,           
            address: data.address,   
            lat: data.lat,           
            lng: data.lng,            
            companyId: companyId,    
        },
        });

        return {
        status: 'success',
        message: 'Depot / Cabang baru berhasil didaftarkan',
        data: newDepot,
        };
    } catch (error) {
        console.error('Error creating depot:', error);
        throw new Error('Gagal membuat depot baru');
    }
  }

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

async createProduct(companyId: string, data: AddProductDto) {
  try {
    const existingProduct = await this.prisma.product.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: 'insensitive',
        },
        companyId: companyId,
      },
    });

    if (existingProduct) {
      throw new BadRequestException(`Produk dengan nama '${data.name}' sudah ada.`);
    }

    const newProduct = await this.prisma.product.create({
      data: {
        name: data.name,
        price: data.price,
        weightEst: data.weightEst,
        volumeEst: data.volumeEst,
        isSubscription: data.isSubscription ?? false,
        durationDays: data.durationDays,
        companyId: companyId, 
      },
    });

    return {
      status: 'success',
      message: 'Produk berhasil ditambahkan',
      data: newProduct,
    };
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw error;
    }
    
    console.error('ERROR CREATE PRODUCT:', error);
    throw new InternalServerErrorException('Gagal menambahkan produk.');
  }
}
}
