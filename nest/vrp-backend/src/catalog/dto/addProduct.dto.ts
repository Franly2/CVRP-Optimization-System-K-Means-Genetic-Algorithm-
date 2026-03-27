/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional, Min, IsArray } from 'class-validator';

export class AddProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  weightEst: number; // kilogram

  @IsNumber()
  @Min(0)
  volumeEst: number; // liter

  @IsArray()
  @IsString({ each: true }) // Memastikan setiap isi array adalah string (ID)
  depotIds: string[];

  @IsBoolean()
  @IsOptional()
  isSubscription?: boolean;

  @IsNumber()
  @IsOptional()
  durationDays?: number; // Wajib jika isSubscription true
}