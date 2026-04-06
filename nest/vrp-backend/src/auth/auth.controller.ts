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

  @Get('branding/:slug') 
  async getPublicBranding(@Param('slug') slug: string) {
    console.log(`Menerima permintaan untuk mendapatkan branding dengan slug: ${slug}`);
    return await this.authService.getBrandingBySlug(slug);
  }

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
    console.log(`Menerima permintaan profil untuk user ID: ${userPayload.userId} dari company ID: ${userPayload.companyId}`);
    const result = await this.prisma.withTenant(userPayload.companyId, async (tx) => {
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
