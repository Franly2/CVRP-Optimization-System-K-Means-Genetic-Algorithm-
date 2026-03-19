/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
import { Body, Controller, ForbiddenException, Post, UseGuards } from '@nestjs/common';
import { HumanService } from './human.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AddAdminDto } from './dto/addAdmin.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { addDriverDto } from './dto/addDriver.dto';

@UseGuards(JwtAuthGuard )
@Controller('human')
export class HumanController {
  constructor(private readonly humanService: HumanService) {}

  @Post('admin')
    async createAdmin(
        @Body() dto: AddAdminDto,
        @GetUser('companyId') companyId: string,
        @GetUser('role') role: string
    ) {
    if (role !== 'OWNER') {
      throw new ForbiddenException('Akses ditolak! Hanya Owner yang bisa menambah Admin Cabang/Depot.');
    }

    return await this.humanService.createAdmin(companyId, dto);
    }

    @Post('driver')
    async createDriver(
        @Body() dto: addDriverDto,
        @GetUser('companyId') companyId: string,
        @GetUser('role') role: string
    ) {
    if (role !== 'OWNER' && role !== 'ADMIN') {
      throw new ForbiddenException('Akses ditolak! Hanya Owner atau Admin yang bisa menambah Driver Cabang/Depot.');
    }

    return await this.humanService.createDriver(dto, role );
    }

    @Post('accept-driver')
    async acceptDriver(
        @Body('userId') driverId: string,
        @GetUser('role') role: string
    ) {
        if (role !== 'OWNER') {
            throw new ForbiddenException('Akses ditolak! Hanya Owner yang bisa menerima Driver.');
        }

        return await this.humanService.acceptDriver(driverId);
    }
}
