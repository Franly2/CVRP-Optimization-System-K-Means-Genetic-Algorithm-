/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { VrpService } from './vrp.service';
import { VrpController } from './vrp.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  providers: [VrpService, PrismaService],
  controllers: [VrpController]
})
export class VrpModule {}
