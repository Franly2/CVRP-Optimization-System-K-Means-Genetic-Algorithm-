/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString } from 'class-validator';

export class addShiftDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama shift tidak boleh kosong' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Waktu mulai tidak boleh kosong' })
  startTime!: string; // Format disarankan "HH:mm"

  @IsString()
  @IsNotEmpty({ message: 'Waktu selesai tidak boleh kosong' })
  endTime!: string; // Format disarankan "HH:mm"
}