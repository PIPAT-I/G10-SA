// 📚 Interfaces สำหรับการจัดการระบบห้องสมุดโดยรวม
// ครอบคลุมการยืม, การจอง, และการจัดการทั่วไป

import type { BorrowWithDetails } from './Borrow';
import type { ReservationWithDetails } from './Reservation';

// ======= User Library Management =======

// 👤 ข้อมูลการใช้งานห้องสมุดของผู้ใช้
export interface UserLibraryProfile {
  user_id: string;
  user_info: {
    UserID: string;
    FirstName: string;
    LastName: string;
    Email: string;
    role: string;
  };
  borrowing_limit: {
    max_books: number; // จำนวนหนังสือที่ยืมได้สูงสุด
    current_count: number; // จำนวนหนังสือที่ยืมอยู่ปัจจุบัน
    available_slots: number; // สล็อตที่เหลือ
  };
  reservation_limit: {
    max_reservations: number; // จำนวนการจองสูงสุด
    current_count: number; // จำนวนการจองปัจจุบัน
    available_slots: number; // สล็อตการจองที่เหลือ
  };
  library_status: {
    is_active: boolean; // สถานะการใช้งานห้องสมุด
    has_overdue: boolean; // มีหนังสือเกินกำหนดหรือไม่
    total_fine: number; // ค่าปรับรวม
    blocked_until?: string; // ถูกบล็อกจนถึงวันที่ (ถ้ามี)
  };
  statistics: {
    total_books_borrowed: number; // หนังสือที่เคยยืมทั้งหมด
    books_returned_on_time: number; // หนังสือที่คืนตรงเวลา
    average_reading_days: number; // วันที่อ่านเฉลี่ย
    favorite_categories: string[]; // หมวดหมู่ที่ชอบ
  };
}

// 📋 Dashboard ของผู้ใช้
export interface UserDashboard {
  profile: UserLibraryProfile;
  current_borrows: BorrowWithDetails[];
  active_reservations: ReservationWithDetails[];
  recent_notifications: Array<{
    id: number;
    type: 'borrow' | 'reservation' | 'overdue' | 'reminder';
    title: string;
    message: string;
    date: string;
    is_read: boolean;
    action_required: boolean;
  }>;
  recommended_books: Array<{
    book_id: number;
    title: string;
    author_names: string;
    cover_image: string;
    reason: string; // เหตุผลที่แนะนำ
    available: boolean;
  }>;
  reading_progress: Array<{
    borrow_id: number;
    book_title: string;
    total_pages: number;
    pages_read: number;
    progress_percentage: number;
    last_reading_date: string;
  }>;
}

// ======= Admin Management =======

// 🏛️ Dashboard สำหรับ Admin
export interface AdminDashboard {
  overview: {
    total_books: number;
    total_users: number;
    books_borrowed: number;
    books_available: number;
    pending_reservations: number;
    overdue_books: number;
  };
  daily_activities: {
    new_borrows: number;
    returns: number;
    new_reservations: number;
    cancelled_reservations: number;
  };
  alerts: Array<{
    type: 'overdue' | 'reservation_expiring' | 'book_damaged' | 'system';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    count: number;
    action_required: boolean;
  }>;
  popular_books: Array<{
    book_id: number;
    title: string;
    author_names: string;
    total_borrows: number;
    current_reservations: number;
    availability_rate: number; // อัตราการให้บริการ
  }>;
  user_activities: Array<{
    user_id: string;
    user_name: string;
    activity_type: 'borrow' | 'return' | 'reserve' | 'cancel';
    book_title: string;
    timestamp: string;
  }>;
}

// 📊 รายงานระบบห้องสมุด
export interface LibraryReport {
  period: {
    start_date: string;
    end_date: string;
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  };
  borrowing_stats: {
    total_borrows: number;
    total_returns: number;
    overdue_returns: number;
    average_borrow_duration: number; // วันเฉลี่ย
    most_borrowed_books: Array<{
      book_id: number;
      title: string;
      borrow_count: number;
    }>;
  };
  reservation_stats: {
    total_reservations: number;
    fulfilled_reservations: number;
    cancelled_reservations: number;
    expired_reservations: number;
    average_wait_time: number; // วันเฉลี่ย
  };
  user_engagement: {
    active_users: number;
    new_registrations: number;
    top_readers: Array<{
      user_id: string;
      user_name: string;
      books_read: number;
      total_pages: number;
    }>;
  };
  collection_performance: {
    utilization_rate: number; // อัตราการใช้งานหนังสือ
    most_popular_categories: Array<{
      category: string;
      borrow_count: number;
      unique_borrowers: number;
    }>;
    underutilized_books: Array<{
      book_id: number;
      title: string;
      last_borrowed_date: string;
      total_borrows: number;
    }>;
  };
}

// ======= System Configuration =======

// ⚙️ การตั้งค่าระบบห้องสมุด
export interface LibrarySettings {
  borrowing_rules: {
    default_loan_period_days: number; // ระยะเวลายืมปกติ (วัน)
    max_renewal_times: number; // จำนวนครั้งสูงสุดในการต่ออายุ
    renewal_period_days: number; // ระยะเวลาต่ออายุ (วัน)
    grace_period_days: number; // ระยะผ่อนผัน (วัน)
    max_books_per_user: {
      default: number;
      student: number;
      faculty: number;
      admin: number;
    };
  };
  reservation_rules: {
    max_reservations_per_user: number;
    reservation_hold_days: number; // จำนวนวันที่จองไว้ได้
    notification_advance_days: number; // แจ้งล่วงหน้ากี่วัน
    expiry_hours: number; // การจองหมดอายุใน (ชั่วโมง)
  };
  fine_system: {
    enabled: boolean;
    daily_fine_rate: number; // ค่าปรับต่อวัน
    maximum_fine: number; // ค่าปรับสูงสุด
    grace_period_days: number; // ไม่เก็บค่าปรับ (วัน)
  };
  notification_settings: {
    due_date_reminder_days: number[]; // แจ้งเตือนก่อนครบกำหนด (วัน)
    overdue_reminder_frequency_days: number; // ความถี่แจ้งเตือนเกินกำหนด
    reservation_notification_methods: ('email' | 'sms' | 'app')[];
  };
}

// ======= API Response Types =======

// 📡 Standard API Response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    version: string;
    pagination?: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
    };
  };
}

// 🔍 Search Results
export interface LibrarySearchResult {
  books: Array<{
    ID: number;
    title: string;
    isbn: string;
    author_names: string;
    publisher_name: string;
    cover_image: string;
    availability: {
      total_copies: number;
      available_copies: number;
      next_available_date?: string;
    };
    can_borrow: boolean;
    can_reserve: boolean;
  }>;
  total_results: number;
  search_query: string;
  filters_applied: {
    category?: string;
    language?: string;
    availability?: boolean;
    author?: string;
    publisher?: string;
  };
}

// 📱 Mobile App Specific
export interface MobileLibraryData {
  user_dashboard: UserDashboard;
  quick_actions: Array<{
    type: 'borrow' | 'return' | 'reserve' | 'renew' | 'search';
    title: string;
    icon: string;
    enabled: boolean;
    badge_count?: number;
  }>;
  offline_data: {
    borrowed_books: BorrowWithDetails[];
    reading_list: number[]; // book IDs
    last_sync: string;
  };
}
