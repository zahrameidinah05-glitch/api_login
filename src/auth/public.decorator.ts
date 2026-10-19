import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Menandai route agar bisa diakses tanpa login (guard JWT dilewati). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
