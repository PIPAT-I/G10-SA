export interface Language {
  ID: number;
  name: string;
}

export interface CreateLanguageRequest {
  name: string;
}

export interface UpdateLanguageRequest {
  ID: number;
  name?: string;
}