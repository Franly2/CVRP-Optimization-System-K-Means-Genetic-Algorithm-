/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,               // menghapus field yang tidak ada di DTO
      forbidNonWhitelisted: true,    // Tolak request jika ada field asing
      transform: true,               // Otomatis ubah tipe data sesuai DTO
    }),
  );

  app.enableCors(
  //   {
  //   origin: process.env.origin, 
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   credentials: true,
  // }
); 

  await app.listen(3000);
}
bootstrap();