export interface FileType {
  ID: number;
  type_name: string; // ให้ตรงกับฝั่ง Go
}

export interface CreateFileTypeRequest {
  type_name: string;
}

export interface UpdateFileTypeRequest {
  ID: number;
  type_name?: string;
}