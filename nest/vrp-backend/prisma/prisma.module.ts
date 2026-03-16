/* eslint-disable prettier/prettier */
// src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Biar gak perlu import berkali-kali di tiap module
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Wajib diexport biar module lain bisa pake
})
export class PrismaModule {}