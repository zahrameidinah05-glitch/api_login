import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  PASSWORD_MAX,
  PASSWORD_MESSAGE,
  PASSWORD_MIN,
  PASSWORD_PATTERN,
  normalizeEmail,
  trim,
} from './common.js';

export class RegisterDto {
  @Transform(trim)
  @Matches(/^[A-Za-z0-9]{4,20}$/, { message: 'NIM harus 4-20 huruf/angka' })
  nim: string;

  @Transform(trim)
  @IsString({ message: 'nama wajib diisi' })
  @MinLength(2, { message: 'nama minimal 2 karakter' })
  @MaxLength(100, { message: 'nama maksimal 100 karakter' })
  name: string;

  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Format email tidak valid' })
  @MaxLength(254, { message: 'email terlalu panjang' })
  email: string;

  @IsString({ message: 'password wajib diisi' })
  @MinLength(PASSWORD_MIN, { message: 'password minimal 8 karakter' })
  @MaxLength(PASSWORD_MAX, { message: 'password maksimal 72 karakter' })
  @Matches(PASSWORD_PATTERN, { message: PASSWORD_MESSAGE })
  password: string;
}
