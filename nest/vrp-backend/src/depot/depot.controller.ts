/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import { Body, Controller, ForbiddenException, Post, UseGuards } from '@nestjs/common';
import { DepotService } from './depot.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AddDepotDto } from './dto/addDepot.dto';
import { GetUser } from 'src/auth/get-user.decorator';

@UseGuards(JwtAuthGuard )
@Controller('depot')
export class DepotController {
  constructor(private readonly depotService: DepotService) {}

   @Post('depot')
    async createDepot(
    @Body() dto: AddDepotDto,
    @GetUser('companyId') companyId: string, // Ambil ID Katering dari Token
    @GetUser('role') role: string            // Ambil Jabatan dari Token
    ) { 
        if (role !== 'OWNER') {
        throw new ForbiddenException('Hanya Owner yang diperbolehkan menambah cabang/depot baru.');
        }
        await this.depotService.createDepot(companyId, dto);
    }
}
