/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class AddProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  weightEst: number; // Estimasi berat dalam gram/kg

  @IsNumber()
  @Min(0)
  volumeEst: number; // Estimasi volume dalam cm3/liter

  @IsBoolean()
  @IsOptional()
  isSubscription?: boolean;

  @IsNumber()
  @IsOptional()
  durationDays?: number; // Wajib diisi jika isSubscription true
}