/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
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
}
