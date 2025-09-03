import type { Publisher } from "./Publisher";
import type { FileType } from "./FileType";
import type { Language } from "./Language";
import type { Author } from "./Author";

export interface Book {
  ID: number;
  title: string;
  isbn?: number;          // แนะนำให้ส่งเป็นเลขล้วน
  total_pages?: number;
  synopsis?: string;

  // FK (snake_case ให้ตรง controller/DB)
  publisher_id?: number;
  file_type_id?: number;
  language_id?: number;
  book_status_id?: number;
  book_license_id?: number;

  // ไฟล์/รูป
  coverImage?: string | null;
  ebookFile?: string | null;

  // preload relations
  publisher?: Publisher;
  file_type?: FileType;
  language?: Language;
  authors?: Author[];
}

export interface CreateBookRequest {
  title: string;
  isbn?: number;
  total_pages?: number;
  synopsis?: string;
  publisher_id?: number;
  file_type_id?: number;
  language_id?: number;
  book_status_id?: number;
  book_license_id?: number;
  cover_url?: string;
  file_url?: string;
}

export interface UpdateBookRequest extends Partial<CreateBookRequest> {
  ID: number;
}