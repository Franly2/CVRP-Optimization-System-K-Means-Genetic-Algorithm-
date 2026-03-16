/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { AuthService, LoginResponse, meResponse } from './auth.service';
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
  @Post(':companySlug/login') // <-- Kunci SaaS: URL login harus ada nama kateringnya
  async loginUser(
    @Param('companySlug') companySlug: string,
    @Body() data: LoginUserDto
  ): Promise<LoginResponse> {
    return this.authService.login(companySlug, data);
  }

  @UseGuards(JwtAuthGuard )
  @Get('me')
  async getProfile(@GetUser() userPayload: any) : Promise<meResponse> { // userPayload cuma berisi { id, role, companyId }
    console.log('Isi Payload JWT:', userPayload);
    const fullUser = await this.prisma.user.findUnique({
      where: { id: userPayload.userId },
      omit : {
        password: true, // gausah ambil passwordnya
      },
      include: {
        company: true, 
        depot: true,   
        vehicle: true  
      }
    });


    return fullUser as meResponse; 
  }
}     
