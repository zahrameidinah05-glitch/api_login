import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { MembersService } from '../members/members.service.js';
import { toPublicMember } from '../members/entities/member.entity.js';
import type { PublicMember } from '../members/entities/member.entity.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { PasswordRecoveryDto } from './dto/password-recovery.dto.js';
import { MailService } from './mail.service.js';

const BCRYPT_ROUNDS = 10;
// Hash tiruan agar waktu respons login tetap sama saat email tidak ditemukan.
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', BCRYPT_ROUNDS);

const sha256 = (value: string) =>
  createHash('sha256').update(value).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    private readonly membersService: MembersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<PublicMember> {
    const password = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const member = this.membersService.create({
      nim: dto.nim,
      name: dto.name,
      email: dto.email,
      password,
    });
    return toPublicMember(member);
  }

  async login(dto: LoginDto) {
    const member = this.membersService.findByEmail(dto.email);
    const valid = await bcrypt.compare(
      dto.password,
      member?.password ?? DUMMY_HASH,
    );
    if (!member || !valid) {
      throw new UnauthorizedException('Email atau password salah');
    }
    if (!member.isActive) {
      throw new ForbiddenException('Akun tidak aktif');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: member.id,
      email: member.email,
      ver: member.tokenVersion,
    });
    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN') ?? '1d',
      member: toPublicMember(member),
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    // Respons selalu sama agar email terdaftar tidak bisa ditebak.
    const response: { message: string; resetToken?: string } = {
      message:
        'Jika email terdaftar, instruksi reset password telah dikirim ke email tersebut',
    };

    const member = this.membersService.findByEmail(dto.email);
    if (!member || !member.isActive) return response;

    const ttl = this.resetTtlMinutes();
    const token = randomBytes(32).toString('hex');
    this.membersService.update(member.id, {
      resetTokenHash: sha256(token),
      resetTokenExpiresAt: new Date(Date.now() + ttl * 60_000),
    });
    this.mailService.sendPasswordReset(member.email, token, ttl);

    // Hanya untuk development/testing, tidak pernah di produksi.
    if (process.env.NODE_ENV !== 'production') {
      response.resetToken = token;
    }
    return response;
  }

  async passwordRecovery(dto: PasswordRecoveryDto) {
    const invalid = new BadRequestException(
      'Token tidak valid atau sudah kedaluwarsa',
    );
    const member = this.membersService.findByEmail(dto.email);
    if (!member?.resetTokenHash || !member.resetTokenExpiresAt) throw invalid;
    if (member.resetTokenExpiresAt.getTime() < Date.now()) throw invalid;

    const given = Buffer.from(sha256(dto.token));
    const stored = Buffer.from(member.resetTokenHash);
    if (given.length !== stored.length || !timingSafeEqual(given, stored)) {
      throw invalid;
    }

    this.membersService.update(member.id, {
      password: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
      tokenVersion: member.tokenVersion + 1,
      resetTokenHash: undefined,
      resetTokenExpiresAt: undefined,
    });
    return { message: 'Password berhasil diubah, silakan login kembali' };
  }

  getProfile(id: number): PublicMember {
    const member = this.membersService.findOne(id);
    if (!member) throw new UnauthorizedException();
    return toPublicMember(member);
  }

  private resetTtlMinutes(): number {
    const value = Number(this.config.get('RESET_TOKEN_TTL_MINUTES'));
    return Number.isFinite(value) && value > 0 ? value : 60;
  }
}
