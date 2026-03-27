/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AddDepotDto } from './dto/addDepot.dto';

@Injectable()
export class DepotService {
    constructor(private readonly prisma: PrismaService) {}
    

    async createDepot(companyId: string, data: AddDepotDto) {
    try {
      const result = await this.prisma.withTenant(companyId, async (tx) => {
        
        const newDepot = await tx.depot.create({
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

      });

      return result;
      
    } catch (error) {
      console.error('Error creating depot:', error);
      throw new Error('Gagal membuat depot baru');
    }
}

    async getAllDepots(companyId: string) {
    try {
      return await this.prisma.withTenant(companyId, async (tx) => {
        
        const depots = await tx.depot.findMany({
          where: { 
            companyId: companyId 
          },
          orderBy: {
            name: 'asc' 
          }
        });

        return {
          status: 'success',
          message: 'Berhasil mengambil data depot',
          data: depots,
        };
        
      });
    } catch (error) {
      console.error('ERROR GET DEPOTS:', error);
      throw new InternalServerErrorException('Terjadi kesalahan saat mengambil data depot.');
    }
  }

    async getDepotById(companyId: string, depotId: string) {
    try {
      return await this.prisma.withTenant(companyId, async (tx) => {
        // cari data depot dan relasinya juga
        const depot = await tx.depot.findUnique({
          where: { 
            id: depotId 
          },
          include: {
            users: true,      // Mengambil daftar admin/driver di depot ini
            orders: true,     // Mengambil daftar order dari depot ini
            packages: true,   // Mengambil daftar paket di depot ini
            routes: true,      // Mengambil daftar rute yang bermula dari depot ini
            products: true     // Mengambil daftar produk yang tersedia di depot ini
          }
        });

        if (!depot) {
          throw new NotFoundException('Depot tidak ditemukan atau Anda tidak memiliki akses.');
        }

        return {
          status: 'success',
          message: 'Berhasil mengambil detail depot beserta relasinya',
          data: depot,
        };
        
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      console.error('ERROR GET DEPOT BY ID:', error);
      throw new InternalServerErrorException('Terjadi kesalahan saat mengambil detail depot.');
    }
  }
}
