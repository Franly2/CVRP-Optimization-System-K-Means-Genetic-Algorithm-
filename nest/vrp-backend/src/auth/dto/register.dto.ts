/* eslint-disable prettier/prettier */
import { 
  IsNotEmpty, 
  IsString, 
  IsEnum, 
  IsOptional, 
  IsDateString, 
} from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;


  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsDateString() 
  @IsNotEmpty()
  birthDate: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  address?: string;

  // @IsOptional()
  // isAvailable?: boolean;

  // buat kendaraan untuk role DRIVER
  @IsString()
  @IsOptional()
  vehicleType?: string;

  @IsString()
  @IsOptional()
  plateNumber?: string;

  @IsOptional()
  maxWeight?: number;

  @IsOptional()
  maxVolume?: number;


  // company
  @IsString()
  @IsNotEmpty()
  companyId: string;
}