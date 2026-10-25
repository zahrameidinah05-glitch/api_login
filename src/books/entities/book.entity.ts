import { create } from 'domain';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name: 'books'})
export class Book {
    @PrimaryGeneratedColumn('uuid')
    id: string;


    @Column({type: 'varchar', length: 30})
    title: string;

    @Column({type: 'varchar', length: 25})
    author: string;

    @Column({type: 'varchar', length: 45})
    isbn: string;

    @Column({type: 'int', default: 0})
    publishedYear: number;

    @Column({type: 'boolean', default: true})
    isAvailable: boolean;

    @CreateDateColumn({name: 'created_at'})
    createdAt: Date;

    @CreateDateColumn({name: 'updated_at'})
    updatedAt: Date;

    @DeleteDateColumn({name: 'deleted_at'})
    deletedAt: Date;
}