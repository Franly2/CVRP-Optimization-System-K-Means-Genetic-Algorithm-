/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AddProductDto } from './dto/addProduct.dto';

@Injectable()
export class CatalogService {
 constructor(private readonly prisma: PrismaService) {}

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
