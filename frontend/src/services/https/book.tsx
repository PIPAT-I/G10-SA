import { apiClient } from "./API";
import type { 
  CreateBookRequest, 
  UpdateBookRequest,
  CreateAuthorRequest, 
  UpdateAuthorRequest,
  CreatePublisherRequest, 
  UpdatePublisherRequest,
  CreateLanguageRequest, 
  UpdateLanguageRequest,
  CreateFileTypeRequest, 
  UpdateFileTypeRequest,
  AddAuthorToBookRequest,
  FindReadingActivitiesQuery,
} from "../../interfaces";

// ==================== Books API ====================
export async function getAllBooks() {
  return await apiClient
    .get("/api/books")
    .then(response => response.data)
    .catch(error => {
      console.error('Get All Books API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function getBookById(id: number) {
  return await apiClient
    .get(`/api/books/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Get Book By ID API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function createBook(data: CreateBookRequest) {
  return await apiClient
    .post("/api/books", data)
    .then(response => response.data)
    .catch(error => {
      console.error('Create Book API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function updateBook(data: UpdateBookRequest & { id: number }) {
  return await apiClient
    .put(`/api/books/${data.id}`, data)
    .then(response => response.data)
    .catch(error => {
      console.error('Update Book API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function deleteBook(id: number) {
  return await apiClient
    .delete(`/api/books/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Delete Book API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

// ==================== Authors API ====================
export async function getAllAuthors() {
  return await apiClient
    .get("/api/authors")
    .then(response => response.data)
    .catch(error => {
      console.error('Get All Authors API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function getAuthorById(id: number) {
  return await apiClient
    .get(`/api/authors/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Get Author By ID API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function createAuthor(data: CreateAuthorRequest) {
  return await apiClient
    .post("/api/authors", data)
    .then(response => response.data)
    .catch(error => {
      console.error('Create Author API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function updateAuthor(data: UpdateAuthorRequest & { id: number }) {
  return await apiClient
    .put(`/api/authors/${data.id}`, data)
    .then(response => response.data)
    .catch(error => {
      console.error('Update Author API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function deleteAuthor(id: number) {
  return await apiClient
    .delete(`/api/authors/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Delete Author API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

// ==================== Publishers API ====================
export async function getAllPublishers() {
  return await apiClient
    .get("/api/publishers")
    .then(response => response.data)
    .catch(error => {
      console.error('Get All Publishers API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function getPublisherById(id: number) {
  return await apiClient
    .get(`/api/publishers/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Get Publisher By ID API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function createPublisher(data: CreatePublisherRequest) {
  return await apiClient
    .post("/api/publishers", data)
    .then(response => response.data)
    .catch(error => {
      console.error('Create Publisher API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function updatePublisher(data: UpdatePublisherRequest & { id: number }) {
  return await apiClient
    .put(`/api/publishers/${data.id}`, data)
    .then(response => response.data)
    .catch(error => {
      console.error('Update Publisher API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function deletePublisher(id: number) {
  return await apiClient
    .delete(`/api/publishers/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Delete Publisher API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

// ==================== Languages API ====================
export async function getAllLanguages() {
  return await apiClient
    .get("/api/languages")
    .then(response => response.data)
    .catch(error => {
      console.error('Get All Languages API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function getLanguageById(id: number) {
  return await apiClient
    .get(`/api/languages/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Get Language By ID API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function createLanguage(data: CreateLanguageRequest) {
  return await apiClient
    .post("/api/languages", data)
    .then(response => response.data)
    .catch(error => {
      console.error('Create Language API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function updateLanguage(data: UpdateLanguageRequest & { id: number }) {
  return await apiClient
    .put(`/api/languages/${data.id}`, data)
    .then(response => response.data)
    .catch(error => {
      console.error('Update Language API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function deleteLanguage(id: number) {
  return await apiClient
    .delete(`/api/languages/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Delete Language API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

// ==================== File Types API ====================
export async function getAllFileTypes() {
  return await apiClient
    .get("/api/file-types")
    .then(response => response.data)
    .catch(error => {
      console.error('Get All File Types API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function getFileTypeById(id: number) {
  return await apiClient
    .get(`/api/file-types/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Get File Type By ID API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function createFileType(data: CreateFileTypeRequest) {
  return await apiClient
    .post("/api/file-types", data)
    .then(response => response.data)
    .catch(error => {
      console.error('Create File Type API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function updateFileType(data: UpdateFileTypeRequest & { id: number }) {
  return await apiClient
    .put(`/api/file-types/${data.id}`, data)
    .then(response => response.data)
    .catch(error => {
      console.error('Update File Type API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function deleteFileType(id: number) {
  return await apiClient
    .delete(`/api/file-types/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Delete File Type API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

// ==================== Book-Authors Relationship API ====================
export async function getAuthorsOfBook(bookId: number) {
  return await apiClient
    .get(`/api/books/${bookId}/authors`)
    .then(response => response.data)
    .catch(error => {
      console.error('Get Authors Of Book API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function addAuthorToBook(data: AddAuthorToBookRequest & { book_id: number }) {
  return await apiClient
    .post(`/api/books/${data.book_id}/authors`, { author_id: (data as any).author_id })
    .then(response => response.data)
    .catch(error => {
      console.error('Add Author To Book API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function removeAuthorFromBook(bookId: number, authorId: number) {
  return await apiClient
    .delete(`/api/books/${bookId}/authors/${authorId}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Remove Author From Book API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

// ==================== Reading Activities API ====================
export async function createReadingActivity(data: any) {
  return await apiClient
    .post("/api/reading-activities", data)
    .then(response => response.data)
    .catch(error => {
      console.error('Create Reading Activity API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function getAllReadingActivities(params?: FindReadingActivitiesQuery) {
  const queryParams = new URLSearchParams();
  if (params?.user_id) queryParams.set("user_id", String(params.user_id));
  if (params?.book_id) queryParams.set("book_id", String(params.book_id));
  if (params?.book_license_id) queryParams.set("book_license_id", String(params.book_license_id));
  const suffix = queryParams.toString() ? `?${queryParams.toString()}` : "";
  
  return await apiClient
    .get(`/api/reading-activities${suffix}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Get All Reading Activities API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function getReadingActivityById(id: number) {
  return await apiClient
    .get(`/api/reading-activities/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Get Reading Activity By ID API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function updateReadingActivity(id: number, data: any) {
  return await apiClient
    .put(`/api/reading-activities/${id}`, data)
    .then(response => response.data)
    .catch(error => {
      console.error('Update Reading Activity API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

export async function deleteReadingActivity(id: number) {
  return await apiClient
    .delete(`/api/reading-activities/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Delete Reading Activity API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}

// ==================== Backward Compatibility Objects ====================
// เพื่อความเข้ากันได้กับโค้ดเก่าที่ใช้ bookAPI.getAll() format
export const bookAPI = {
  create: createBook,
  getAll: getAllBooks,
  getById: getBookById,
  update: updateBook,
  delete: deleteBook,
};

export const authorAPI = {
  create: createAuthor,
  getAll: getAllAuthors,
  getById: getAuthorById,
  update: updateAuthor,
  delete: deleteAuthor,
};

export const publisherAPI = {
  create: createPublisher,
  getAll: getAllPublishers,
  getById: getPublisherById,
  update: updatePublisher,
  delete: deletePublisher,
};

export const languageAPI = {
  create: createLanguage,
  getAll: getAllLanguages,
  getById: getLanguageById,
  update: updateLanguage,
  delete: deleteLanguage,
};

export const fileTypeAPI = {
  create: createFileType,
  getAll: getAllFileTypes,
  getById: getFileTypeById,
  update: updateFileType,
  delete: deleteFileType,
};

export const bookAuthorAPI = {
  getOfBook: getAuthorsOfBook,
  add: addAuthorToBook,
  removeByPair: removeAuthorFromBook,
  findAll: async () => {
    try {
      const books = await getAllBooks();
      const bookAuthors: any[] = [];
      if (Array.isArray(books)) {
        books.forEach((book: any) => {
          if (book.authors && Array.isArray(book.authors)) {
            book.authors.forEach((author: any) => {
              bookAuthors.push({
                book_id: book.ID || book.id,
                author_id: author.ID || author.id,
                Author: author,
                Book: book
              });
            });
          }
        });
      }
      return bookAuthors;
    } catch (error) {
      console.error('Get All Book Authors API Error:', error);
      return { error: 'Network error' };
    }
  }
};

export const readingActivityAPI = {
  create: createReadingActivity,
  getAll: getAllReadingActivities,
  getById: getReadingActivityById,
  update: updateReadingActivity,
  delete: deleteReadingActivity,
};