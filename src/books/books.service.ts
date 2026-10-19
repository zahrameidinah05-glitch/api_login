import { Injectable } from '@nestjs/common';
import { Book } from './entities/book.entity.js';

@Injectable()
export class BooksService {
    private books: Book[] = [
        {
            id: 1,
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            isbn: '9780743273565',
            publishedDate: new Date('1925-04-10'),
            isaavailable: true,
        },
        {
            id: 2,
            title: 'To Kill a Mockingbird',
            author: 'Harper Lee',
            isbn: '9780061120084',
            publishedDate: new Date('1960-07-11'),
            isaavailable: false,
        },
        {
            id: 3,
            title: '1984',
            author: 'George Orwell',
            isbn: '9780451524935',
            publishedDate: new Date('1949-06-08'),
            isaavailable: true,
        }
    ];

    // Menampilkan data semua buku
    findAll(): Book[] {
        return this.books;
    }

    // Menampilkan data buku berdasarkan id
    findOne(id: number): Book | undefined {
        return this.books.find((book) => book.id === id);
    }

    // Menyimpan data buku baru ke "database" (id auto increment)
    create(bookData: Omit<Book, 'id'>): Book {
        const newBook: Book = {
            id: this.books.length
                ? Math.max(...this.books.map((b) => b.id)) + 1
                : 1,
            ...bookData,
        };
        this.books.push(newBook);
        return newBook;
    }

    // Mengupdate buku berdasarkan id
    update(id: number, bookData: Partial<Book>): Book | null {
        const index = this.books.findIndex((book) => book.id === id);
        if (index === -1) return null;

        this.books[index] = { ...this.books[index], ...bookData };
        return this.books[index];
    }

    // Menghapus data buku berdasarkan id
    remove(id: number): boolean {
        const index = this.books.findIndex((book) => book.id === id);
        if (index === -1) return false;

        this.books.splice(index, 1);
        return true;
    }
}