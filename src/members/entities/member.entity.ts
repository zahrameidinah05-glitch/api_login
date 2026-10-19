export class Member {
  id: number;
  nim: string;
  name: string;
  email: string;
  phone?: string;
  /** Hash bcrypt, JANGAN PERNAH dikembalikan ke client. */
  password: string;
  joinedDate: Date;
  isActive: boolean;
  /** SHA-256 dari token reset password (token asli hanya dikirim ke email). */
  resetTokenHash?: string;
  resetTokenExpiresAt?: Date;
  /** Naik setiap password diganti; JWT dengan versi lama otomatis tidak valid. */
  tokenVersion: number;
}

/** Bentuk member yang aman dikirim ke client. */
export type PublicMember = Omit<
  Member,
  'password' | 'resetTokenHash' | 'resetTokenExpiresAt' | 'tokenVersion'
>;

export function toPublicMember(member: Member): PublicMember {
  const {
    password: _password,
    resetTokenHash: _resetTokenHash,
    resetTokenExpiresAt: _resetTokenExpiresAt,
    tokenVersion: _tokenVersion,
    ...safe
  } = member;
  return safe;
}
