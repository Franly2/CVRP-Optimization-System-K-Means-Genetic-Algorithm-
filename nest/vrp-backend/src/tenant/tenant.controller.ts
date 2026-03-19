/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import { Body, Controller, UseGuards} from '@nestjs/common';
import { TenantService } from './tenant.service';
// import { GetUser } from '../auth/get-user.decorator';
// import { ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
// import { AddProductDto } from './dto/addProduct.dto';

@UseGuards(JwtAuthGuard )
@Controller('tenant')
export class TenantController {
    constructor(private readonly tenantService: TenantService) {}
    // @Post('products')
    // async createProduct(
    //   @Body() dto: AddProductDto,
    //   @GetUser('companyId') companyId: string,
    //   @GetUser('role') role: string
    // ) {
    //   if (role !== 'OWNER' && role !== 'ADMIN') {
    //     throw new ForbiddenException('Hanya Owner atau Admin yang boleh menambah produk.');
    //   }

    //   return await this.tenantService.createProduct(companyId, dto);
    // }
}
