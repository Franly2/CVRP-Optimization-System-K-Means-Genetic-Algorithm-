/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountStatus, Prisma, Role } from '@prisma/client';

// Interface untuk respon login
export interface LoginResponse {
  access_token: string;
  role: string;
  username: string;
  companyId: string;
}

export interface meResponse {
  id: string;
  username: string;
  fullName: string;
  phoneNumber: string;
  birthDate: Date;
  role: Role;
  company: {
    id: string;
    name: string;
    slug: string;
  };
  depot: {
    id: string;
    name: string;
    address: string;
  } | null;
  vehicle: {
    id: string;
    plateNumber: string;
    model: string;
    maxWeight: number;
    maxVolume: number;
  } | null;
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
      companyId,
      vehicleType,
      plateNumber,
      maxWeight, 
      maxVolume,
    } = data;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      // Perbaikan: Hanya buat data kendaraan jika dia mendaftar sebagai kurir
      const vehicleData = role === 'DRIVER' ? {
        create: {
          plateNumber: plateNumber ?? "-",
          model: vehicleType ?? "-",   
          maxWeight: maxWeight ? Number(maxWeight) : 0, 
          maxVolume: maxVolume ? Number(maxVolume) : 0,
        },
      } : undefined;

      await this.prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          role: role as Role,
          fullName,
          phoneNumber,
          birthDate: new Date(birthDate),
          companyId,
          ...(vehicleData && { vehicle: vehicleData }), // Gabungkan secara dinamis
        },
      });

      return {
        status: 'success',
        message: 'Akun berhasil dibuat',
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // Pesan error disesuaikan dengan arsitektur baru
          throw new ConflictException('Username sudah terpakai di perusahaan ini!');
        }
      }
      console.error('Registration Error:', error);
      throw new InternalServerErrorException('Gagal mendaftar user');
    }
  }

  async login(companySlug: string, data: LoginUserDto): Promise<LoginResponse> {
    const { username, password } = data;
    const company = await this.prisma.company.findUnique({
      where: { slug: companySlug },
    });

    if (!company) {
      throw new UnauthorizedException('Perusahaan tidak ditemukan atau URL salah');
    }
    const user = await this.prisma.user.findFirst({
      where: { username, companyId: company.id },
    });

    if (!user) {
      throw new UnauthorizedException('Username tidak terdaftar');
    }

    if(user.role !== 'OWNER') {
      if (user.status === AccountStatus.PENDING) {
        throw new ForbiddenException('Akun Anda masih menunggu persetujuan Owner.');
      }

      if (user.status === AccountStatus.REJECTED) {
        throw new ForbiddenException('Maaf, pendaftaran akun Anda ditolak.');
      }

      if (user.status === AccountStatus.SUSPENDED) {
        throw new ForbiddenException('Akun Anda telah dinonaktifkan. Silakan hubungi Admin.');
      }
    } 

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Password salah!');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      companyId: user.companyId,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      role: user.role,
      username: user.username,
      companyId: user.companyId,
    };
  }
}