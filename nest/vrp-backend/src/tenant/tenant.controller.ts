/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import { Body, Controller, Post, UseGuards} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { GetUser } from '../auth/get-user.decorator';
import { ForbiddenException } from '@nestjs/common';
import { AddDepotDto } from './dto/addDepot.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AddAdminDto } from './dto/addAdmin.dto';
import { AddProductDto } from './dto/addProduct.dto';

@UseGuards(JwtAuthGuard )
@Controller('tenant')
export class TenantController {
    constructor(private readonly tenantService: TenantService) {}

    @Post('depot')
        async createDepot(
        @Body() dto: AddDepotDto,
        @GetUser('companyId') companyId: string, // Ambil ID Katering dari Token
        @GetUser('role') role: string            // Ambil Jabatan dari Token
        ) { 
            if (role !== 'OWNER') {
            throw new ForbiddenException('Hanya Owner yang diperbolehkan menambah cabang/depot baru.');
            }

            await this.tenantService.createDepot(companyId, dto);
        }

    @Post('admin')
    async createAdmin(
        @Body() dto: AddAdminDto,
        @GetUser('companyId') companyId: string,
        @GetUser('role') role: string
    ) {
    if (role !== 'OWNER') {
      throw new ForbiddenException('Akses ditolak! Hanya Owner yang bisa menambah Admin Cabang/Depot.');
    }

    return await this.tenantService.createAdmin(companyId, dto);
  }

  @Post('products')
  async createProduct(
    @Body() dto: AddProductDto,
    @GetUser('companyId') companyId: string,
    @GetUser('role') role: string
  ) {
    if (role !== 'OWNER' && role !== 'ADMIN') {
      throw new ForbiddenException('Hanya Owner atau Admin yang boleh menambah produk.');
    }

    return await this.tenantService.createProduct(companyId, dto);
  }
  
}
