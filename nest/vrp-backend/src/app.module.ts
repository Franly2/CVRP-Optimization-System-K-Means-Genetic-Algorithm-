/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { VrpModule } from './vrp/vrp.module';
import { TenantModule } from './tenant/tenant.module';

@Module({
  imports: [PrismaModule,
    AuthModule,
    VrpModule,
    TenantModule,
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
