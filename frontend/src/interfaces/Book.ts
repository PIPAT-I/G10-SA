import type { Member } from "./Member";
export interface Book {
    ID: number;
    title: string;
    totalpage: number;
    synopsis: string;
    isbn: string;
    coverimage: string;
    ebookFile: string;
    publishedYear: number;
    user?: Member;

}

