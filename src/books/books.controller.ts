import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
} from '@nestjs/common';
import { BooksService } from './books.service.js';
import { Book } from './entities/book.entity.js';

@Controller('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) {}

    @Get()
    async findAll(): Promise<Book[]> {
        return await this.booksService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Book> {
        return await this.booksService.findById(id);
    }

    @Post()
    async create(@Body() bookData: Partial<Book>): Promise<Book> {
        return await this.booksService.create(bookData);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() bookData: Partial<Book>,
    ): Promise<Book> {
        return await this.booksService.update(id, bookData);
    }

    @Delete(':id')
    async remove(
        @Param('id') id: string,
    ): Promise<{ message: string; deletedId: string }> {
        return await this.booksService.remove(id);
    }
}