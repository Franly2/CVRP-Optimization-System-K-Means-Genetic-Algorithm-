/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // <--- Import ini

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,               // Hapus properti yang tidak ada di DTO
      forbidNonWhitelisted: true,    // Tolak request jika ada field asing
      transform: true,               // Otomatis ubah tipe data sesuai DTO
    }),
  );

  app.enableCors(); 

  await app.listen(3000);
}
bootstrap();