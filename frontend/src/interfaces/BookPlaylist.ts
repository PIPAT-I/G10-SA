import type { Booklist } from "./Booklist";
import type { Book } from "./Book";

export interface BookPlaylist {
  ID: number;
  booklist_id: number;
  booklist?: Booklist;
  book_id: number;
  book?: Book;
}
