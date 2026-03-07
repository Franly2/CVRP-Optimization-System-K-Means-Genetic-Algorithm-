/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';

// Interface untuk respon login
export interface LoginResponse {
  access_token: string;
  role: string;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(data: RegisterUserDto): Promise<{ status: string; message: string }> {
    const { 
      username, 
      password, 
      role, 
      fullName, 
      birthDate, 
      phoneNumber,
      maxCapacity 
    } = data;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      await this.prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          role: role as Role,
          fullName,
          phoneNumber,
          birthDate: new Date(birthDate),
          maxCapacity: maxCapacity ? Number(maxCapacity) : 20,
        },
      });

      return {
      status: 'success',
      message: 'Akun berhasil dibuat',
    };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Username sudah terpakai!');
        }
      }
      
      console.error('Registration Error:', error);
      throw new InternalServerErrorException('Gagal mendaftar user');
    }
  }

  async login(data: LoginUserDto): Promise<LoginResponse> {
    const { username, password } = data;

    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Username tidak terdaftar');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Password salah!');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      role: user.role,
      username: user.username,
    };
  }
}