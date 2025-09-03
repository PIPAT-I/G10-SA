import type { Book } from "./Book";

export interface Author {
  ID: number;
  name: string;
  books?: Book[];
}

export interface CreateAuthorRequest {
  name: string;
}
export interface UpdateAuthorRequest {
  ID: number;
  name?: string;
}