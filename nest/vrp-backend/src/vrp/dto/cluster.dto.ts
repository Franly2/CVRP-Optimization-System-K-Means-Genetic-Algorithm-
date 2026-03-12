/* eslint-disable prettier/prettier */
import { 
  IsArray, 
  IsString, 
  ArrayNotEmpty, 
  ValidateNested, 
  IsNumber, 
  Min, 
  Max 
} from 'class-validator';
import { Type } from 'class-transformer';

// lokasi depot
class DepotLocationDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;
}

//class utama
export class ClusterRequest {
  @IsArray({ message: 'driverIds harus berupa array' })
  @ArrayNotEmpty({ message: 'Minimal harus ada 1 kurir yang dipilih' })
  @IsString({ each: true, message: 'Setiap ID kurir harus berupa string' })
  driverIds: string[];

  @IsArray({ message: 'packageIds harus berupa array' })
  @ArrayNotEmpty({ message: 'Minimal harus ada 1 paket yang dipilih' })
  @IsString({ each: true, message: 'Setiap ID paket harus berupa string' })
  packageIds: string[];

  @ValidateNested()
  @Type(() => DepotLocationDto) 
  depotLocation: DepotLocationDto;
}