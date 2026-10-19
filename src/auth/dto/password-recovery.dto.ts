import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Match } from '../validators/match.decorator.js';
import {
  PASSWORD_MAX,
  PASSWORD_MESSAGE,
  PASSWORD_MIN,
  PASSWORD_PATTERN,
  normalizeEmail,
  trim,
} from './common.js';

export class PasswordRecoveryDto {
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  /** Token dari link yang dikirim ke email (hasil "Forgot password"). */
  @Transform(trim)
  @IsString({ message: 'token wajib diisi' })
  @IsNotEmpty({ message: 'token wajib diisi' })
  @MaxLength(256, { message: 'token tidak valid' })
  token: string;

  @IsString({ message: 'password wajib diisi' })
  @MinLength(PASSWORD_MIN, { message: 'password minimal 8 karakter' })
  @MaxLength(PASSWORD_MAX, { message: 'password maksimal 72 karakter' })
  @Matches(PASSWORD_PATTERN, { message: PASSWORD_MESSAGE })
  password: string;

  @IsString({ message: 'konfirmasi password wajib diisi' })
  @Match('password')
  passwordConfirm: string;
}
