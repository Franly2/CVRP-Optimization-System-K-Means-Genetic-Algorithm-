/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class TenantService {
    constructor(private readonly prisma: PrismaService) {}

    async getTenant(companyId: string) {
    try {
      return await this.prisma.withTenant(companyId, async (tx) => {
        
        const company = await tx.company.findUnique({
          where: { id: companyId },
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            colorPrimary: true,
            colorSecondary: true,
            colorTertiary: true,
            tier: true,
          },
        });

        if (!company) {
          throw new NotFoundException('Data branding tenant tidak ditemukan.');
        }

        return {
          status: 'success',
          message: 'Data branding berhasil dimuat melalui tenant context',
          data: company,
        };
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Gagal mengambil data perusahaan.');
    }
  }
}
