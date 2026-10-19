import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
const normalizeEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

/** Password & status tidak bisa diubah lewat sini (pakai alur recovery). */
export class UpdateMemberDto {
  @IsOptional()
  @Transform(trim)
  @Matches(/^[A-Za-z0-9]{4,20}$/, { message: 'NIM harus 4-20 huruf/angka' })
  nim?: string;

  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'nama tidak valid' })
  @MinLength(2, { message: 'nama minimal 2 karakter' })
  @MaxLength(100, { message: 'nama maksimal 100 karakter' })
  name?: string;

  @IsOptional()
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Format email tidak valid' })
  email?: string;

  @IsOptional()
  @Transform(trim)
  @Matches(/^[0-9+\-\s]{6,20}$/, { message: 'Nomor telepon tidak valid' })
  phone?: string;
}
