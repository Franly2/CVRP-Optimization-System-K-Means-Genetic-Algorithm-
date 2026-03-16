/* eslint-disable prettier/prettier */
import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { AuthService, LoginResponse } from './auth.service';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async registerUser(@Body() data: RegisterUserDto) { 
    return this.authService.registerUser(data); 
  }
  
  // @HttpCode(HttpStatus.OK) 
  // @Post('login')
  // async loginUser(@Body() data: LoginUserDto) : Promise<LoginResponse> {
  //   return this.authService.login(data);
  // }

  @HttpCode(HttpStatus.OK) 
  @Post(':companySlug/login') // <-- Kunci SaaS: URL login harus ada nama kateringnya
  async loginUser(
    @Param('companySlug') companySlug: string,
    @Body() data: LoginUserDto
  ): Promise<LoginResponse> {
    return this.authService.login(companySlug, data);
  }
}     
