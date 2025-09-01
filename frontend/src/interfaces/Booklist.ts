import type { Member } from "./Member";
import type { Book } from "./Book";
import type { BookPlaylist } from "./BookPlaylist";

export interface Booklist {
  ID: number;
  title: string;
  user_id: number;
  member?: Member;
  book?: Book[];
  BookPlaylist?: BookPlaylist[];
}

export interface CreateBooklistRequest {
  title: string;
  user_id: number;
  book?: Book[];
}

export interface UpdateBooklistRequest {
  ID: number;
  title?: string;
}

export interface AddToBooklistRequest {
  playlist_id: number;
  book_id: number;
  book?: Book[];
}
