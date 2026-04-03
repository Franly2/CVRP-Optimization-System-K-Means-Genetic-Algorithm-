/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AddProductDto } from './dto/addProduct.dto';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(companyId: string, role: string,  data: AddProductDto) {
    try {
      return await this.prisma.withTenant(companyId, async (tx) => {
        
        const existingProduct = await tx.product.findFirst({
          where: {
            name: {
              equals: data.name,
              mode: 'insensitive',
            },
            companyId: companyId, 
          },
        });

        if (existingProduct) {
          throw new BadRequestException(`Produk dengan nama '${data.name}' sudah ada di katalog Anda.`);
        }

        let initialStatus: ProductStatus = ProductStatus.PENDING;
  
        if (role === 'OWNER') {
          initialStatus = ProductStatus.UNAVAILABLE;
        }

        const newProduct = await tx.product.create({
          data: {
            name: data.name,
            price: data.price,
            weightEst: data.weightEst,
            volumeEst: data.volumeEst,
            isSubscription: data.isSubscription ?? false,
            durationDays: data.durationDays,
            companyId: companyId, 
            status: initialStatus,
            availableAt: {
              connect: data.depotIds?.map((id) => ({ id })) || [],
            },
          },
          include: {
            availableAt: true 
          }
        });

        return {
          status: 'success',
          message: 'Produk berhasil ditambahkan dan tersedia di depot terkait.',
          data: newProduct,
        };
        
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      console.error('ERROR CREATE PRODUCT:', error);
      throw new InternalServerErrorException('Gagal menambahkan produk.');
    }
  }

  async changeProductStatus(
    companyId: string, 
    productId: string, 
    newStatus: ProductStatus, 
    role: string
  ) {
    try {
      return await this.prisma.withTenant(companyId, async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        if (!product || product.companyId !== companyId) {
          throw new NotFoundException('Produk tidak ditemukan.');
        }

        if (role === 'ADMIN') {
          const forbiddenForAdmin: ProductStatus[] = [ProductStatus.REJECTED];
          
          if (forbiddenForAdmin.includes(newStatus)) {
            throw new BadRequestException('Hanya Owner yang dapat menolak produk baru.');
          }
          if (product.status === ProductStatus.PENDING) {
            throw new BadRequestException('Produk masih dalam status PENDING. Tunggu persetujuan Owner.');
          }
        }

        const updatedProduct = await tx.product.update({
          where: { id: productId },
          data: { status: newStatus },
        });

        return {
          status: 'success',
          message: `Status produk berhasil diubah menjadi ${newStatus}`,
          data: updatedProduct,
        };
      });
    } catch (error: unknown) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('ERROR CHANGE STATUS:', errorMessage);
      throw new InternalServerErrorException('Gagal mengubah status produk.');
    }
  }

  async getProductById(companyId: string, productId: string) {
    try {
      return await this.prisma.withTenant(companyId, async (tx) => {
        const product = await tx.product.findUnique({
          where: { 
            id: productId 
          },
          include: {
            // Mengambil daftar depot yang terhubung (Many-to-Many)
            availableAt: {
              select: {
                id: true,
                name: true,
                address: true,
              }
            },
            // --- TAMBAHKAN RELASI IMAGES DI SINI ---
            images: {
              orderBy: [
                { isMain: 'desc' }, // isMain: true akan berada di urutan [0]
                { order: 'asc' },   // Sisanya diurutkan sesuai nomor urut
              ],
            },
          }
        });

        // Pengecekan companyId sudah otomatis diatasi oleh withTenant, 
        // tapi tidak apa-apa untuk proteksi ekstra
        if (!product || product.companyId !== companyId) {
          throw new NotFoundException(`Produk dengan ID ${productId} tidak ditemukan.`);
        }

        return {
          status: 'success',
          message: 'Berhasil mengambil detail produk',
          data: product,
        };
      });
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('ERROR GET PRODUCT BY ID:', errorMessage);
      throw new InternalServerErrorException('Gagal mengambil detail produk.');
    }
  }

  async updateProduct(companyId: string, productId: string, dto: AddProductDto) {
    try {
      return await this.prisma.withTenant(companyId, async (tx) => {
        // Cek eksistensi
        const product = await tx.product.findUnique({ where: { id: productId } });
        if (!product || product.companyId !== companyId) {
          throw new NotFoundException('Produk tidak ditemukan.');
        }

        const updated = await tx.product.update({
          where: { id: productId },
          data: {
            name: dto.name,
            price: dto.price,
            weightEst: dto.weightEst,
            volumeEst: dto.volumeEst,
            isSubscription: dto.isSubscription,
            durationDays: dto.isSubscription ? dto.durationDays : null,
            // LOGIKA SYNC MANY-TO-MANY:
            availableAt: {
              set: dto.depotIds?.map(id => ({ id })) || [] 
              // 'set' akan otomatis putus (disconnect) depot yang tidak ada di list baru
            }
          },
          include: { availableAt: true }
        });

        return {
          status: 'success',
          message: 'Berhasil memperbarui produk',
          data: updated
        };
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error("UPDATE_PRODUCT_ERROR:", error);
      throw new InternalServerErrorException('Gagal memperbarui data produk.');
    }
  }
}