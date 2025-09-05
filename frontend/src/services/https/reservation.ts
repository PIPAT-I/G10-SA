import { apiClient } from "./API";
import type { Reservation, ReservationFilter } from "../../interfaces/Reservation";

// ======= Reservation API Services =======

// 📋 ดึงรายการการจองทั้งหมด (สำหรับ Admin)
export const getAllReservations = async (filters?: ReservationFilter): Promise<Reservation[]> => {
  const params = new URLSearchParams();
  
  if (filters?.user_id) params.append('user_id', filters.user_id);
  if (filters?.book_id) params.append('book_id', filters.book_id.toString());
  if (filters?.status) params.append('status', filters.status);

  const response = await apiClient.get(`/api/reservations?${params.toString()}`);
  return response.data.data;
};

// 📋 ดึงการจองของผู้ใช้คนหนึ่ง
export const getUserReservations = async (userId: string): Promise<Reservation[]> => {
  const response = await apiClient.get(`/api/reservations?user_id=${userId}`);
  return response.data.data;
};

// 📄 ดึงข้อมูลการจองตาม ID
export const getReservationById = async (id: number): Promise<Reservation> => {
  const response = await apiClient.get(`/api/reservations/${id}`);
  return response.data.data;
};

// ➕ สร้างการจองใหม่
export const createReservation = async (reservationRequest: {
  user_id: string;
  book_id: number;
}): Promise<Reservation> => {
  const response = await apiClient.post(`/api/reservations`, reservationRequest);
  return response.data.data;
};

// ✅ ดำเนินการจอง (Fulfill) - เมื่อมีหนังสือพร้อม
export const fulfillReservation = async (id: number, userId: string): Promise<Reservation> => {
  const response = await apiClient.patch(`/api/reservations/${id}/fulfill`, {
    user_id: userId
  });
  return response.data.data;
};

// ❌ ยกเลิกการจอง
export const cancelReservation = async (id: number, userId: string, reason?: string): Promise<Reservation> => {
  const response = await apiClient.patch(`/api/reservations/${id}/cancel`, {
    user_id: userId,
    reason: reason
  });
  return response.data.data;
};

// 🔢 ดูลำดับในคิวรอ
export const getQueuePosition = async (id: number): Promise<{
  position: number;
  total_ahead: number;
  estimated_wait_days?: number;
}> => {
  const response = await apiClient.get(`/api/reservations/${id}/queue-position`);
  return response.data.data;
};

// ======= Utility Functions =======

// 🎨 สีสำหรับสถานะการจอง
export const getReservationStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'waiting': return 'orange';
    case 'notified': return 'blue';
    case 'fulfilled': return 'green';
    case 'expired': return 'red';
    case 'cancelled': return 'gray';
    default: return 'default';
  }
};

// 📝 ข้อความสถานะการจอง
export const getReservationStatusText = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'waiting': return 'รอการจัดสรร';
    case 'notified': return 'แจ้งเตือนแล้ว';
    case 'fulfilled': return 'เสร็จสิ้น';
    case 'expired': return 'หมดอายุ';
    case 'cancelled': return 'ยกเลิก';
    default: return 'ไม่ทราบ';
  }
};

// 🕒 ตรวจสอบว่าการจองใกล้หมดอายุไหม
export const isNearExpiry = (expiresAt?: string): boolean => {
  if (!expiresAt) return false;
  
  const now = new Date();
  const expiry = new Date(expiresAt);
  const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return hoursUntilExpiry > 0 && hoursUntilExpiry <= 24; // น้อยกว่า 24 ชั่วโมง
};

// 📊 คำนวณเวลาที่เหลือก่อนหมดอายุ
export const getTimeUntilExpiry = (expiresAt?: string): string => {
  if (!expiresAt) return '';
  
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffMs = expiry.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'หมดอายุแล้ว';
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `เหลือ ${hours} ชั่วโมง ${minutes} นาที`;
  } else {
    return `เหลือ ${minutes} นาที`;
  }
};
