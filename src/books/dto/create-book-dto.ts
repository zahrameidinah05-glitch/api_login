import { IsNotEmpty } from 'class-validator';
export class CreateBookDto {
    @IsNotEmpty({ message: 'Title tidak boleh kosong' })
    readonly title: string;
    @IsNotEmpty({ message: 'Author tidak boleh kosong' })
    readonly author: string;
    @IsNotEmpty({ message: 'ISBN tidak boleh kosong' })
    readonly isbn: string;
    @IsNotEmpty({ message: 'Tahun terbit tidak boleh kosong' })
    readonly publishedYear: number;
    @IsNotEmpty({ message: 'Status ketersediaan tidak boleh kosong' })
    readonly isAvailable: boolean;
}
