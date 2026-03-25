/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { AuthService, LoginResponse } from './auth.service';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';
import { GetUser } from './get-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from 'prisma/prisma.service';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly prisma: PrismaService) {}

  @Post('/register')
  async registerUser(@Body() data: RegisterUserDto) { 
    return this.authService.registerUser(data); 
  }

  @HttpCode(HttpStatus.OK) 
  @Post(':companySlug/login') 
  async loginUser(
    @Param('companySlug') companySlug: string,
    @Body() data: LoginUserDto
  ): Promise<LoginResponse> {
    return this.authService.login(companySlug, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@GetUser() userPayload: any): Promise<any> { 
    const result = await this.prisma.withTenant(userPayload.companyId, async (tx) => {

      // const dbSetting = await tx.$queryRaw`
      //   SELECT current_setting('app.current_tenant', true) as tenant
      // `;
      // console.log('ID Tenant di Sesi Postgres:', dbSetting);
      // console.log('ID Tenant dari JWT:', userPayload.companyId);

      // const allCompaniesRLS = await tx.company.findMany();
      // console.log(`[DENGAN RLS] Jumlah perusahaan yang terlihat: ${allCompaniesRLS.length}`);

      const fullUser = await tx.user.findUnique({
        where: { id: userPayload.userId },
        omit: { password: true },
        include: { company: true, depot: true, vehicle: true }
      });

      return fullUser;
    });
    return result;
  }
}     
