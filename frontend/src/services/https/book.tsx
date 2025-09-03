import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";

// ใช้ base URL จาก .env (Vite)
const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:8088";

// ---------- helpers ----------
const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find((row) => row.startsWith(`${name}=`));
  if (!cookie) return null;
  let AccessToken = decodeURIComponent(cookie.split("=")[1]);
  AccessToken = AccessToken.replace(/\\/g, "").replace(/"/g, "");
  return AccessToken || null;
};

const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${getCookie("0195f494-feaa-734a-92a6-05739101ede9")}`,
    "Content-Type": "application/json",
  },
});
const getConfigWithoutAuth = () => ({ headers: { "Content-Type": "application/json" } });

// ---------- base methods ----------
export const Post = async (url: string, data: any, requireAuth = true): Promise<AxiosResponse | any> => {
  const config = requireAuth ? getConfig() : getConfigWithoutAuth();
  return axios
    .post(`${API_URL}${url}`, data, config)
    .then((res) => res) // คงพฤติกรรมเดิมสำหรับตัวที่เช็ค res.status
    .catch((error: AxiosError) => {
      if (error?.response?.status === 401) {
        localStorage.clear();
        window.location.reload();
      }
      return error.response;
    });
};

export const Get = async (url: string, requireAuth = true): Promise<AxiosResponse | any> => {
  const config = requireAuth ? getConfig() : getConfigWithoutAuth();
  return axios
    .get(`${API_URL}${url}`, config)
    .then((res) => res.data)
    .catch((error: AxiosError) => {
      if (error?.response?.status === 401) {
        localStorage.clear();
        window.location.reload();
      }
      return error.response;
    });
};

export const Update = async (url: string, data: any, requireAuth = true): Promise<AxiosResponse | any> => {
  const config = requireAuth ? getConfig() : getConfigWithoutAuth();
  return axios
    .put(`${API_URL}${url}`, data, config)
    .then((res) => res.data)
    .catch((error: AxiosError) => {
      if (error?.response?.status === 401) {
        localStorage.clear();
        window.location.reload();
      }
      return error.response;
    });
};

export const Delete = async (url: string, requireAuth = true): Promise<AxiosResponse | any> => {
  const config = requireAuth ? getConfig() : getConfigWithoutAuth();
  return axios
    .delete(`${API_URL}${url}`, config)
    .then((res) => res.data)
    .catch((error: AxiosError) => {
      if (error?.response?.status === 401) {
        localStorage.clear();
        window.location.reload();
      }
      return error.response;
    });
};

// ---------- domain APIs (e-book) ----------
import type {
  // books
  CreateBookRequest, UpdateBookRequest,
  // authors
  CreateAuthorRequest, UpdateAuthorRequest,
  // publishers
  CreatePublisherRequest, UpdatePublisherRequest,
  // languages
  CreateLanguageRequest, UpdateLanguageRequest,
  // file types
  CreateFileTypeRequest, UpdateFileTypeRequest,
  // pivot
  AddAuthorToBookRequest,
  // reading activities
  FindReadingActivitiesQuery,
} from "../../interfaces";

/* ===================== Books ===================== */
export const bookAPI = {
  // BE ปัจจุบัน: POST /books สร้าง, GET /books ทั้งหมด
  create: (data: CreateBookRequest) => Post("admin/books", data, false),
  getAll: () => Get("admin/books", false),

  // BE ของคุณยังคง GET /book/:id (legacy) → ถ้าไป RESTful ค่อยสลับเป็น /books/:id
  getById: (id: number) => Get(`admin/book/${id}`, false),

  // BE รองรับ /book/update (legacy)
  update: (data: UpdateBookRequest) => Update("admin/book/update", data, false),

  delete: (id: number) => Delete(`admin/book/${id}`, false),
};

/* ===================== Authors ===================== */
export const authorAPI = {
  create: (data: CreateAuthorRequest) => Post("admin/new-author", data, false),
  getAll: () => Get("admin/authors", false),
  getById: (id: number) => Get(`admin/author/${id}`, false),
  update: (data: UpdateAuthorRequest) => Update("admin/author/update", data, false),
  delete: (id: number) => Delete(`admin/author/${id}`, false),
};

/* ===================== Publishers (RESTful) ===================== */
export const publisherAPI = {
  create: (data: CreatePublisherRequest) => Post("admin/publishers", data, false),
  getAll: () => Get("admin/publishers", false),
  getById: (id: number) => Get(`admin/publishers/${id}`, false),
  update: (data: UpdatePublisherRequest & { id: number }) => Update(`admin/publishers/${data.id}`, data, false),
  delete: (id: number) => Delete(`admin/publishers/${id}`, false),
};

/* ===================== Languages (RESTful) ===================== */
export const languageAPI = {
  create: (data: CreateLanguageRequest) => Post("admin/languages", data, false),
  getAll: () => Get("admin/languages", false),
  getById: (id: number) => Get(`admin/languages/${id}`, false),
  update: (data: UpdateLanguageRequest & { id: number }) => Update(`admin/languages/${data.id}`, data, false),
  delete: (id: number) => Delete(`admin/languages/${id}`, false),
};

/* ===================== File types (RESTful) ===================== */
export const fileTypeAPI = {
  create: (data: CreateFileTypeRequest) => Post("admin/file-types", data, false),
  getAll: () => Get("admin/file-types", false),
  getById: (id: number) => Get(`admin/file-types/${id}`, false),
  update: (data: UpdateFileTypeRequest & { id: number }) => Update(`admin/file-types/${data.id}`, data, false),
  delete: (id: number) => Delete(`admin/file-types/${id}`, false),
};

/* ===================== Pivot: Book-Authors (association endpoints) ===================== */
export const bookAuthorAPI = {
  // ดึงรายชื่อผู้แต่งของหนังสือ → []Author
  getOfBook: (bookId: number) => Get(`admin/books/${bookId}/authors`, false),

  // ผูกผู้แต่งเข้ากับหนังสือ
  add: (data: AddAuthorToBookRequest & { book_id: number }) =>
    Post(`admin/books/${data.book_id}/authors`, { author_id: (data as any).author_id }, false),

  // เอาผู้แต่งออกจากหนังสือ
  removeByPair: (bookId: number, authorId: number) =>
    Delete(`admin/books/${bookId}/authors/${authorId}`, false),

  // (back-compat) เผื่อโค้ดส่วนอื่นยังเรียกแบบเดิม
  findAll: (params?: { book_id?: number }) => {
    if (!params?.book_id) return [];
    return Get(`admin/books/${params.book_id}/authors`, false);
  },

  // (deprecated) ไม่ใช้แล้ว
  removeById: (_id: number) => {
    console.warn("removeById for book_authors is deprecated; use removeByPair(bookId, authorId) instead.");
    return Promise.resolve(null);
  },
};

/* ===================== Reading activities (เดิม) ===================== */
export const readingActivityAPI = {
  create: (data: any) => Post("/new-reading-activity", data, false),
  getAll: (params?: FindReadingActivitiesQuery) => {
    const q = new URLSearchParams();
    if (params?.user_id) q.set("user_id", String(params.user_id));
    if (params?.book_id) q.set("book_id", String(params.book_id));
    if (params?.book_license_id) q.set("book_license_id", String(params.book_license_id));
    const suffix = q.toString() ? `?${q.toString()}` : "";
    return Get(`/reading-activities${suffix}`, false);
  },
  getById: (id: number) => Get(`/reading-activity/${id}`, false),
  update: (data: any) => Update("/reading-activity/update", data, false),
  delete: (id: number) => Delete(`/reading-activity/${id}`, false),
};