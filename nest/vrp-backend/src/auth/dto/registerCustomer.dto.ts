/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString } from 'class-validator';
export class RegisterCustomerDto {
    @IsString()
    @IsNotEmpty({ message: 'Password tidak boleh kosong' })
    password!: string;

    @IsString()
    @IsNotEmpty({ message: 'Nomor telepon tidak boleh kosong' })
    phoneNumber!: string;

    @IsString()
    @IsNotEmpty({ message: 'Tanggal lahir tidak boleh kosong' })
    birthDate!: string; // "YYYY-MM-DD"


    //fullname
    @IsString()
    @IsNotEmpty({ message: 'Nama lengkap tidak boleh kosong' })
    fullName!: string;

    //username 
    @IsString()
    @IsNotEmpty({ message: 'Username tidak boleh kosong' })
    username!: string;
}