import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ForbiddenException,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { MembersService } from './members.service.js';
import { toPublicMember } from './entities/member.entity.js';
import type { PublicMember } from './entities/member.entity.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthUser } from '../auth/current-user.decorator.js';

// Seluruh route di sini butuh login. Pembuatan member dilakukan lewat
// POST /auth/register.
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  findAll(): PublicMember[] {
    return this.membersService.findAll().map(toPublicMember);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): PublicMember {
    const member = this.membersService.findOne(id);
    if (!member) {
      throw new NotFoundException(`Member dengan id ${id} tidak ditemukan`);
    }
    return toPublicMember(member);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() memberData: UpdateMemberDto,
    @CurrentUser() user: AuthUser,
  ): PublicMember {
    if (user.id !== id) {
      throw new ForbiddenException('Anda hanya dapat mengubah akun sendiri');
    }
    const updated = this.membersService.update(id, memberData);
    if (!updated) {
      throw new NotFoundException(`Member dengan id ${id} tidak ditemukan`);
    }
    return toPublicMember(updated);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ): { message: string } {
    if (user.id !== id) {
      throw new ForbiddenException('Anda hanya dapat menghapus akun sendiri');
    }
    const removed = this.membersService.remove(id);
    if (!removed) {
      throw new NotFoundException(`Member dengan id ${id} tidak ditemukan`);
    }
    return { message: `Member dengan id ${id} berhasil dihapus` };
  }
}
