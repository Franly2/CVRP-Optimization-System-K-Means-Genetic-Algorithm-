/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { AuthService, LoginResponse, RegisterResponse } from './auth.service';
import { RegisterCustomerDto } from './dto/registerCustomer.dto';
import { LoginUserDto } from './dto/login.dto';
import { GetUser } from './get-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from 'prisma/prisma.service';
import { RegisterUserDto } from './dto/register.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly prisma: PrismaService) {}

  @Get('branding/:slug') 
  async getPublicBranding(@Param('slug') slug: string) {
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

  //customer
  @HttpCode(HttpStatus.OK) 
  @Post(':companySlug/register') 
  async addCustomer(
    @Param('companySlug') companySlug: string,
    @Body() data: RegisterCustomerDto
  ): Promise<RegisterResponse> {
    return this.authService.registerCustomer(companySlug, data);
  }
}     
