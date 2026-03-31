/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import { Body, Controller, Get, UseGuards} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/auth/get-user.decorator';

@UseGuards(JwtAuthGuard )
@Controller('tenant')
export class TenantController {
    constructor(private readonly tenantService: TenantService) {}

    @Get('')
    async getMyCompanyBranding(@GetUser('companyId') companyId: string) {
        return await this.tenantService.getTenant(companyId);
    }
}
