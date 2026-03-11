/* eslint-disable prettier/prettier */
import { Controller, Post, Body } from '@nestjs/common';
import { VrpService } from './vrp.service';

@Controller('vrp')
export class VrpController {
  constructor(private readonly vrpService: VrpService) {}

  @Post('optimize')
  async optimize(@Body() body: { courierLat: number; courierLng: number }) {
    // panggil service untuk generate rute
    return await this.vrpService.getOptimizedRoute(body.courierLat, body.courierLng);
  }
}