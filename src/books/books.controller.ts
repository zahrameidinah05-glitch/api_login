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
import { BooksService } from './books.service.js';
import { Book } from './entities/book.entity.js';

@Controller('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) {}

    @Get()
    findAll(): Book[] {
        return this.booksService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Book {
        const book = this.booksService.findOne(id);
        if (!book) {
            throw new NotFoundException(`Buku dengan id ${id} tidak ditemukan`);
        }
        return book;
    }

    @Post()
    create(@Body() bookData: Omit<Book, 'id'>): Book {
        return this.booksService.create(bookData);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() bookData: Partial<Book>,
    ): Book {
        const updated = this.booksService.update(id, bookData);
        if (!updated) {
            throw new NotFoundException(`Buku dengan id ${id} tidak ditemukan`);
        }
        return updated;
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number): { message: string } {
        const removed = this.booksService.remove(id);
        if (!removed) {
            throw new NotFoundException(`Buku dengan id ${id} tidak ditemukan`);
        }
        return { message: `Buku dengan id ${id} berhasil dihapus` };
    }
}
