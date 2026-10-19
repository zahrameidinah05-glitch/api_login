import { Injectable } from '@nestjs/common';
import { Category } from './entities/category.entity.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
  // Dummy data kategori (simulasi database sementara)
  private categories: Category[] = [
    { id: 1, name: 'Fiksi', description: 'Buku-buku cerita fiksi dan novel' },
    {
      id: 2,
      name: 'Non-Fiksi',
      description: 'Buku berbasis fakta, biografi, dan sejarah',
    },
    {
      id: 3,
      name: 'Sains & Teknologi',
      description: 'Buku seputar ilmu pengetahuan dan teknologi',
    },
    { id: 4, name: 'Anak-anak', description: 'Buku bacaan untuk anak-anak' },
  ];

  // Menampilkan semua kategori
  findAll(): Category[] {
    return this.categories;
  }

  // Menampilkan kategori berdasarkan id
  findOne(id: number): Category | undefined {
    return this.categories.find((category) => category.id === id);
  }

  // Menyimpan kategori baru (simulasi database, id auto increment)
  create(categoryData: CreateCategoryDto): Category {
    const newCategory: Category = {
      id: this.categories.length
        ? Math.max(...this.categories.map((c) => c.id)) + 1
        : 1,
      name: categoryData.name,
      description: categoryData.description ?? '',
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  // Mengupdate kategori berdasarkan id
  update(id: number, categoryData: UpdateCategoryDto): Category | null {
    const index = this.categories.findIndex((category) => category.id === id);
    if (index === -1) return null;

    this.categories[index] = { ...this.categories[index], ...categoryData };
    return this.categories[index];
  }

  // Menghapus kategori berdasarkan id
  remove(id: number): boolean {
    const index = this.categories.findIndex((category) => category.id === id);
    if (index === -1) return false;

    this.categories.splice(index, 1);
    return true;
  }
}
