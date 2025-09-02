import type { Book } from "./Book";
import type { Author } from "./Author";

export interface BookAuthor {
  ID: number;
  book_id: number;
  author_id: number;
  book?: Book;
  author?: Author;
}

export interface AddAuthorToBookRequest {
  book_id: number;
  author_id: number;
}
