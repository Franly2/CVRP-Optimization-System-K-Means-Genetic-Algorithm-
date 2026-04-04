/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async withTenant<T>(
  companyId: string,
  fn: (tx: PrismaClient) => Promise<T>,
): Promise<T> {
  return this.$transaction(async (tx: any) => { 
    // VVV INI YANG DIUBAH VVV
    await tx.$executeRawUnsafe(
      `SET LOCAL app.current_tenant_id = '${companyId}'`
      //  untuk tes rls
      // `SET LOCAL app.current_tenant_id = 'dwdadwadawdwad'`
    );
    return fn(tx);
  });
}
}
