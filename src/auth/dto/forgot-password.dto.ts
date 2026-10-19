import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';
import { normalizeEmail } from './common.js';

export class ForgotPasswordDto {
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;
}
