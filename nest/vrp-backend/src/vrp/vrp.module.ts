/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { VrpService } from './vrp.service';
import { VrpController } from './vrp.controller';

@Module({
  providers: [VrpService],
  controllers: [VrpController]
})
export class VrpModule {}
