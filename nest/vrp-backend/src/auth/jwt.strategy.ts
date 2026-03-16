/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Ngambil token dari header "Authorization: Bearer <token>"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // SECRET KEY HARUS SAMA DENGAN YANG DI AUTH MODULE!
      secretOrKey: process.env.JWT_SECRET || 'default_secret_key', 
    });
  }

  // Fungsi ini otomatis jalan kalau tokennya valid
  validate(payload: any) {
    // Apapun yang di-return di sini, akan masuk ke object 'req.user'
    return { 
      userId: payload.sub, 
      username: payload.username, 
      role: payload.role,
      companyId: payload.companyId // <-- Ini yang paling penting buat SaaS!
    };
  }
}