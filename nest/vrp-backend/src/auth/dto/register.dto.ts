/* eslint-disable prettier/prettier */
import { 
  IsNotEmpty, 
  IsString, 
  IsEnum, 
  IsOptional, 
  IsDateString, 
  IsNumber 
} from 'class-validator';
import { Type } from 'class-transformer';
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

  @IsString()
  @IsOptional()
  vehicleType?: string;

  @IsString()
  @IsOptional()
  plateNumber?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number) 
  maxCapacity?: number;

  @IsOptional()
  isAvailable?: boolean;
}