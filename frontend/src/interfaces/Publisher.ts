import type { Book } from "./Book";

export interface Publisher {
  ID: number;
  name: string;
  books?: Book[];
}

export interface CreatePublisherRequest {
  name: string;
}
export interface UpdatePublisherRequest {
  ID: number;
  name?: string;
}
