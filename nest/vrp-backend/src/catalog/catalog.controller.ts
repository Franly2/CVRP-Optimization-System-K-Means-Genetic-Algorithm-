/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { Body, Controller, ForbiddenException, Post, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AddProductDto } from 'src/catalog/dto/addProduct.dto';
import { GetUser } from 'src/auth/get-user.decorator';

@UseGuards(JwtAuthGuard )
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post('products')
    async createProduct(
      @Body() dto: AddProductDto,
      @GetUser('companyId') companyId: string,
      @GetUser('role') role: string
    ) {
      if (role !== 'OWNER' && role !== 'ADMIN') {
        throw new ForbiddenException('Hanya Owner atau Admin yang boleh menambah produk.');
      }

      return await this.catalogService.createProduct(companyId, dto);
    }
}
