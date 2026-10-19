import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { normalizeEmail } from './common.js';

export class LoginDto {
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @IsString({ message: 'password wajib diisi' })
  @IsNotEmpty({ message: 'password wajib diisi' })
  @MaxLength(72, { message: 'password terlalu panjang' })
  password: string;
}
