import { apiClient } from "./API";
import type { Borrow, BorrowFilter } from "../../interfaces/Borrow";

// ======= Borrow API Services =======

// 📋 ดึงรายการการยืมทั้งหมด (สำหรับ Admin)
export const getAllBorrows = async (filters?: BorrowFilter): Promise<Borrow[]> => {
  const params = new URLSearchParams();
  
  if (filters?.user_id) params.append('user_id', filters.user_id);
  if (filters?.status === 'active') params.append('active', 'true');
  if (filters?.status === 'returned') params.append('active', 'false');

  const response = await apiClient.get(`/api/borrows?${params.toString()}`);
  return response.data.data;
};

// 📋 ดึงการยืมของผู้ใช้คนหนึ่ง
export const getUserBorrows = async (userId: string): Promise<Borrow[]> => {
  const response = await apiClient.get(`/api/borrows?user_id=${userId}`);
  return response.data.data;
};

// 📄 ดึงข้อมูลการยืมตาม ID
export const getBorrowById = async (id: number): Promise<Borrow> => {
  const response = await apiClient.get(`/api/borrows/${id}`);
  return response.data.data;
};

// ➕ สร้างการยืมใหม่
export const createBorrow = async (borrowRequest: {
  user_id: string;
  book_id?: number;
  book_license_id?: number;
}): Promise<Borrow> => {
  const response = await apiClient.post(`/api/borrows`, borrowRequest);
  return response.data.data;
};

// 🔄 คืนหนังสือ
export const returnBorrow = async (id: number, userId: string): Promise<Borrow> => {
  const response = await apiClient.patch(`/api/borrows/${id}/return`, {
    user_id: userId
  });
  return response.data.data;
};

// ======= Job Services =======

// 🤖 Auto-return overdue books (Admin only)
export const autoReturnOverdueBooks = async (): Promise<{
  processed_count: number;
  total_overdue: number;
  errors?: string[];
}> => {
  const response = await apiClient.post('/api/jobs/auto-return');
  return response.data.data;
};

// 🤖 Expire notified reservations (Admin only)
export const expireNotifiedReservations = async (): Promise<{
  processed_count: number;
  total_expired: number;
  errors?: string[];
}> => {
  const response = await apiClient.post('/api/jobs/expire-notified');
  return response.data.data;
};

// ======= Utility Functions =======

// 📊 คำนวณสถานะการยืม
export const calculateBorrowStatus = (dueDate: string, returnDate?: string): 'active' | 'returned' | 'overdue' => {
  if (returnDate) return 'returned';
  
  const now = new Date();
  const due = new Date(dueDate);
  
  return now > due ? 'overdue' : 'active';
};

// 📅 คำนวณจำนวนวันที่เหลือ/เกิน
export const calculateDaysFromDue = (dueDate: string): number => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};


// 📝 ข้อความสถานะ
export const getStatusText = (status: string): string => {
  switch (status) {
    case 'active': return 'กำลังยืม';
    case 'returned': return 'คืนแล้ว';
    case 'overdue': return 'เกินกำหนด';
    default: return 'ไม่ทราบ';
  }
};
