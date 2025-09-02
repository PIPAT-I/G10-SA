import axios from 'axios';
import type { LoginForm, LoginResponse, User } from '../../../interfaces/Sigin';

// 📍 การตั้งค่า
const BACKEND_URL = 'http://localhost:8080/api';
const STORAGE_KEYS = {
  TOKEN: 'authToken',
  USER: 'currentUser',
} as const;

// 🌐 API Client
const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: { 'Content-Type': 'application/json' },
});

// 🔑 เพิ่ม Token อัตโนมัติ
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 🔧 ฟังก์ชันช่วย: จัดการ localStorage
const storage = {
  get: (key: string) => localStorage.getItem(key),
  set: (key: string, value: string) => localStorage.setItem(key, value),
  remove: (key: string) => localStorage.removeItem(key),
  clear: () => Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
};

// 🚪 เข้าสู่ระบบ
export const login = async (loginData: LoginForm): Promise<LoginResponse> => {
  try {
    console.log('🔄 กำลังเข้าสู่ระบบ...');
    const response = await apiClient.post('/auth/login', loginData);
    console.log('✅ เข้าสู่ระบบสำเร็จ!');
    return response.data;
  } catch (error: any) {
    console.error('❌ เข้าสู่ระบบไม่สำเร็จ:', error.message);
    throw error;
  }
};

// 💾 บันทึกข้อมูลผู้ใช้
export const saveSession = (token: string, user: User): void => {
  storage.set(STORAGE_KEYS.TOKEN, token);
  storage.set(STORAGE_KEYS.USER, JSON.stringify(user));
  console.log('💾 บันทึกข้อมูลผู้ใช้แล้ว');
};

// 👤 ดึงข้อมูลผู้ใช้
export const getUser = (): User | null => {
  const userString = storage.get(STORAGE_KEYS.USER);
  return userString ? JSON.parse(userString) : null;
};

// 🔑 ดึง Token
export const getToken = (): string | null => {
  return storage.get(STORAGE_KEYS.TOKEN);
};

// ✅ เช็คการ Login (ต้องมีทั้ง token และ user)
export const isAuthenticated = (): boolean => {
  return !!(getToken() && getUser());
};

// 👑 เช็ค Admin
export const isAdmin = (): boolean => {
  return getUser()?.role === 'admin';
};

// 📋 ดึง Role
export const getRole = (): 'admin' | 'user' | null => {
  return getUser()?.role as 'admin' | 'user' || null;
};

// 🚪 ออกจากระบบ (ลบข้อมูลทั้งหมด)
export const logout = (): void => {
  storage.clear();
  console.log('🚪 ออกจากระบบแล้ว');
};

// 🎯 Export รวม
const authen = {
  login,
  saveSession,
  getUser,
  getToken,
  isAuthenticated,
  isAdmin,
  getRole,
  logout
};

export { authen };
export default authen;
