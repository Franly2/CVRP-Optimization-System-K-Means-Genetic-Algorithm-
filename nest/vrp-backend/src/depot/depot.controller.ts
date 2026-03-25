/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import { Body, Controller, ForbiddenException, Get, Param, Post, UseGuards } from '@nestjs/common';
import { DepotService } from './depot.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AddDepotDto } from './dto/addDepot.dto';
import { GetUser } from 'src/auth/get-user.decorator';

@UseGuards(JwtAuthGuard )
@Controller('depot')
export class DepotController {
  constructor(private readonly depotService: DepotService) {}

    @UseGuards(JwtAuthGuard)
    @Post('')
    async createDepot(
    @Body() dto: AddDepotDto,
    @GetUser('companyId') companyId: string, 
    @GetUser('role') role: string         
    ) { 
        if (role !== 'OWNER') {
        throw new ForbiddenException('Hanya Owner yang diperbolehkan menambah cabang/depot baru.');
        }
        return await this.depotService.createDepot(companyId, dto);
    }


    @Get()
    async getAllDepots(
      @GetUser('companyId') companyId: string,
    ) {
      return await this.depotService.getAllDepots(companyId);
    }

    @Get(':id')
    async getDepotById(
      @Param('id') id: string,                
      @GetUser('companyId') companyId: string, 
    ) {
      return await this.depotService.getDepotById(companyId, id);
    }
}
