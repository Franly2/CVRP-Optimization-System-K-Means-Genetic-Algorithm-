/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    // Kalau kita manggil @GetUser('companyId'), dia cuma balikin companyId
    if (data) {
      return request.user[data];
    }
    
    // Kalau manggil @GetUser() doang, dia balikin full object user
    return request.user;
  },
);