import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { Category } from './entities/category.entity.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { Public } from '../auth/public.decorator.js';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  findAll(): Category[] {
    return this.categoriesService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Category {
    const category = this.categoriesService.findOne(id);
    if (!category) {
      throw new NotFoundException(`Kategori dengan id ${id} tidak ditemukan`);
    }
    return category;
  }

  @Post()
  create(@Body() categoryData: CreateCategoryDto): Category {
    return this.categoriesService.create(categoryData);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() categoryData: UpdateCategoryDto,
  ): Category {
    const updated = this.categoriesService.update(id, categoryData);
    if (!updated) {
      throw new NotFoundException(`Kategori dengan id ${id} tidak ditemukan`);
    }
    return updated;
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): { message: string } {
    const removed = this.categoriesService.remove(id);
    if (!removed) {
      throw new NotFoundException(`Kategori dengan id ${id} tidak ditemukan`);
    }
    return { message: `Kategori dengan id ${id} berhasil dihapus` };
  }
}
