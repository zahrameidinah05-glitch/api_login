import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity.js';

@Injectable()
export class BooksService {
    constructor(
        @InjectRepository(Book)
        private readonly booksRepository: Repository<Book>,
    ) {}

    //mencari semua data buku
    async findAll(): Promise<Book[]> {
        return await this.booksRepository.find({
            order:{createdAt: 'DESC'}
        });
    }

    
    // Menyimpan data buku baru ke database
    async create(book: Partial<Book>): Promise<Book> {
        const newBook = this.booksRepository.create(book);
        return await this.booksRepository.save(newBook);
    }

   async findById(id: string): Promise<Book> {
        const book = await this.booksRepository.findOneBy({ id });
        if (!book) {
            throw new Error(`Book with ID ${id} not found`);
        }
        return book;
    }

    // Mengupdate data buku berdasarkan ID
    async update(id: string, updatedBookDTO: Partial<Book>): Promise<Book> {
        const book = await this.findById(id);

       const updatedBook = this.booksRepository.merge(book, updatedBookDTO);
        return await this.booksRepository.save(updatedBook);
    }

    // Menghapus data buku berdasarkan ID;
    async remove(id: string): Promise<{ message: string, deletedId: string }> {
        await this.findById(id);

        await this.booksRepository.softDelete({ id });
        return { message: `Book with ID ${id} has been deleted`, deletedId: id };
    }
}