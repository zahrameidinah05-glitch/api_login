import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { randomBytes } from 'node:crypto';
import { MembersModule } from '../members/members.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { MailService } from './mail.service.js';

@Module({
  imports: [
    MembersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        let secret = config.get<string>('JWT_SECRET');
        if (!secret) {
          if (process.env.NODE_ENV === 'production') {
            throw new Error('JWT_SECRET wajib diisi di production');
          }
          secret = randomBytes(48).toString('hex');
          new Logger('Auth').warn(
            'JWT_SECRET belum diset; memakai secret acak (token hilang saat restart)',
          );
        } else if (
          process.env.NODE_ENV === 'production' &&
          secret.length < 32
        ) {
          throw new Error('JWT_SECRET minimal 32 karakter');
        }
        return {
          secret,
          signOptions: {
            expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '1d') as any,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    MailService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AuthModule {}
