// 📚 Interfaces สำหรับระบบจองหนังสือ
// อ้างอิงจาก backend entities: reservation.go, reservation_status.go

// ======= Reservation System Interfaces =======

// 🏷️ สถานะการจอง
export interface ReservationStatus {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string;
  status_name: string; // "Waiting", "Notified", "Fulfilled", "Expired", "Cancelled"
  reservations?: Reservation[];
}

// 📋 การจองหนังสือ
export interface Reservation {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string;
  reservation_date: string; // วันที่จอง
  user_id: string;
  user?: {
    UserID: string;
    FirstName: string;
    LastName: string;
    Email: string;
  };
  book_id: number;
  book?: {
    ID: number;
    title: string;
    isbn: string;
    cover_image: string;
    publisher?: {
      ID: number;
      publisher_name: string;
    };
    authors?: Array<{
      ID: number;
      author_name: string;
    }>;
  };
  reservation_status_id: number;
  reservation_status?: ReservationStatus;
  // ข้อมูลเมื่อมีหนังสือพร้อมให้ยืม
  allocated_book_license_id?: number;
  allocated_book_license?: {
    ID: number;
    book_license_id: string;
    book_status?: {
      status_name: string;
    };
  };
  notified_at?: string; // วันที่แจ้งเตือนผู้ใช้
  expires_at?: string; // วันที่การจองหมดอายุ
}

// ======= Form Interfaces =======

// 📝 ฟอร์มสำหรับจองหนังสือ
export interface ReservationRequest {
  book_id: number;
  user_id: string;
  reservation_date?: string; // ถ้าไม่ระบุจะใช้วันปัจจุบัน
}

// 📝 ฟอร์มสำหรับยกเลิกการจอง
export interface CancelReservationRequest {
  reservation_id: number;
  user_id: string;
  reason?: string; // เหตุผลในการยกเลิก
}

// 📝 ฟอร์มสำหรับตอบรับการจอง (เมื่อได้รับแจ้งเตือน)
export interface AcceptReservationRequest {
  reservation_id: number;
  user_id: string;
  accept: boolean; // true = ตอบรับ, false = ปฏิเสธ
}

// ======= Response Interfaces =======

// 📊 ข้อมูลการจองพร้อมรายละเอียด
export interface ReservationWithDetails extends Reservation {
  // เพิ่มข้อมูลที่คำนวณได้
  queue_position: number; // ลำดับในคิวรอ
  estimated_available_date?: string; // วันที่คาดว่าจะได้รับ
  days_waiting: number; // จำนวนวันที่รออยู่
  is_expired: boolean; // หมดอายุหรือไม่
  can_cancel: boolean; // สามารถยกเลิกได้หรือไม่
  notification_sent: boolean; // ส่งแจ้งเตือนแล้วหรือไม่
  time_left_to_respond?: number; // เวลาที่เหลือในการตอบรับ (ชั่วโมง)
}

// 📋 รายการการจองของผู้ใช้
export interface UserReservationsResponse {
  active_reservations: ReservationWithDetails[]; // การจองที่ยังไม่เสร็จสิ้น
  waiting_reservations: ReservationWithDetails[]; // การจองที่รออยู่
  notified_reservations: ReservationWithDetails[]; // การจองที่ได้รับแจ้งเตือนแล้ว
  reservation_history: ReservationWithDetails[]; // ประวัติการจอง
  total_active: number; // จำนวนการจองที่ยังใช้งานอยู่
}

// 📈 สถิติการจอง
export interface ReservationStatistics {
  total_reservations: number;
  active_reservations: number;
  waiting_reservations: number;
  fulfilled_this_month: number;
  cancelled_this_month: number;
  average_waiting_days: number;
  most_reserved_books: Array<{
    book_id: number;
    title: string;
    reservation_count: number;
    current_queue_length: number;
  }>;
}

// 📚 สถานะการจองของหนังสือ
export interface BookReservationStatus {
  book_id: number;
  book_title: string;
  total_copies: number; // จำนวนเล่มทั้งหมด
  available_copies: number; // จำนวนเล่มที่ว่าง
  borrowed_copies: number; // จำนวนเล่มที่ถูกยืม
  total_reservations: number; // จำนวนการจองทั้งหมด
  queue_length: number; // ความยาวของคิวรอ
  estimated_wait_time_days: number; // เวลารอโดยประมาณ (วัน)
  next_available_date?: string; // วันที่คาดว่าจะมีเล่มว่าง
  reservation_queue: Array<{
    position: number;
    user_id: string;
    user_name: string;
    reservation_date: string;
    status: string;
  }>;
}

// ======= Error Interfaces =======

// ⚠️ ข้อผิดพลาดในการจอง
export interface ReservationError {
  code: string;
  message: string;
  details?: {
    book_id?: number;
    user_id?: string;
    current_reservations?: number; // จำนวนการจองปัจจุบันของผู้ใช้
    max_reservations?: number; // จำนวนการจองสูงสุดที่อนุญาต
    existing_reservation_id?: number; // ID ของการจองที่มีอยู่แล้ว
    queue_position?: number; // ลำดับในคิวหากจองสำเร็จ
  };
}

// ======= Utility Types =======

// 🔍 ตัวกรองการจอง
export interface ReservationFilter {
  user_id?: string;
  book_id?: number;
  status?: 'waiting' | 'notified' | 'fulfilled' | 'expired' | 'cancelled' | 'all';
  date_from?: string;
  date_to?: string;
  sort_by?: 'reservation_date' | 'queue_position' | 'status';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// 📄 การแบ่งหน้า
export interface PaginatedReservationResponse {
  data: ReservationWithDetails[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

// 🔔 การแจ้งเตือนการจอง
export interface ReservationNotification {
  reservation_id: number;
  user_id: string;
  book_title: string;
  book_license_id: string;
  message: string;
  notification_type: 'available' | 'expiring' | 'expired';
  sent_at: string;
  expires_at: string;
  action_required: boolean; // ต้องตอบรับหรือไม่
}

// 📊 Dashboard สำหรับ Admin
export interface ReservationDashboard {
  pending_notifications: ReservationNotification[]; // การแจ้งเตือนที่รอส่ง
  expiring_reservations: ReservationWithDetails[]; // การจองที่กำลังจะหมดอายุ
  queue_summary: Array<{
    book_id: number;
    book_title: string;
    queue_length: number;
    oldest_reservation_date: string;
  }>;
  daily_stats: {
    new_reservations: number;
    fulfilled_reservations: number;
    cancelled_reservations: number;
    expired_reservations: number;
  };
}
