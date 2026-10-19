import { ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Member } from './entities/member.entity.js';

export type CreateMemberInput = {
  nim: string;
  name: string;
  email: string;
  phone?: string;
  /** Sudah dalam bentuk hash. */
  password: string;
};

@Injectable()
export class MembersService {
  // Dummy data member (simulasi database sementara).
  // Password seed sengaja acak & tidak diketahui siapa pun, jadi akun ini
  // tidak bisa dipakai login sampai pemiliknya memakai "lupa password".
  private members: Member[] = [
    {
      id: 1,
      nim: '2023001',
      name: 'Andi Saputra',
      email: 'andi.saputra@example.com',
      phone: '081234567890',
      password: MembersService.unusablePassword(),
      joinedDate: new Date('2023-01-15'),
      isActive: true,
      tokenVersion: 0,
    },
    {
      id: 2,
      nim: '2023002',
      name: 'Budi Santoso',
      email: 'budi.santoso@example.com',
      phone: '081298765432',
      password: MembersService.unusablePassword(),
      joinedDate: new Date('2023-03-22'),
      isActive: true,
      tokenVersion: 0,
    },
    {
      id: 3,
      nim: '2024001',
      name: 'Citra Dewi',
      email: 'citra.dewi@example.com',
      phone: '081345678901',
      password: MembersService.unusablePassword(),
      joinedDate: new Date('2024-06-05'),
      isActive: false,
      tokenVersion: 0,
    },
  ];

  private static unusablePassword(): string {
    return bcrypt.hashSync(randomUUID(), 4);
  }

  findAll(): Member[] {
    return this.members;
  }

  findOne(id: number): Member | undefined {
    return this.members.find((member) => member.id === id);
  }

  findByEmail(email: string): Member | undefined {
    const normalized = email.trim().toLowerCase();
    return this.members.find((member) => member.email === normalized);
  }

  findByNim(nim: string): Member | undefined {
    return this.members.find((member) => member.nim === nim);
  }

  private assertUnique(
    data: { email?: string; nim?: string },
    ignoreId?: number,
  ): void {
    if (data.email) {
      const found = this.findByEmail(data.email);
      if (found && found.id !== ignoreId) {
        throw new ConflictException('Email sudah terdaftar');
      }
    }
    if (data.nim) {
      const found = this.findByNim(data.nim);
      if (found && found.id !== ignoreId) {
        throw new ConflictException('NIM sudah terdaftar');
      }
    }
  }

  create(memberData: CreateMemberInput): Member {
    this.assertUnique(memberData);
    const newMember: Member = {
      id: this.members.length
        ? Math.max(...this.members.map((m) => m.id)) + 1
        : 1,
      joinedDate: new Date(),
      isActive: true,
      tokenVersion: 0,
      ...memberData,
      email: memberData.email.trim().toLowerCase(),
    };
    this.members.push(newMember);
    return newMember;
  }

  update(id: number, memberData: Partial<Member>): Member | null {
    const index = this.members.findIndex((member) => member.id === id);
    if (index === -1) return null;

    this.assertUnique(memberData, id);
    this.members[index] = { ...this.members[index], ...memberData };
    return this.members[index];
  }

  remove(id: number): boolean {
    const index = this.members.findIndex((member) => member.id === id);
    if (index === -1) return false;

    this.members.splice(index, 1);
    return true;
  }
}
