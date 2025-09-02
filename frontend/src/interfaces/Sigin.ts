export interface LoginForm {
  identifier: string; // email หรือ userID
  password: string;
}

// Interface User แบบ minimal - เอาแค่ที่จำเป็นสำหรับ frontend
export interface User {
  userID: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string; // "admin" | "user"
}

export interface LoginResponse {
  token: string;
  user: User;
  message?: string;
}