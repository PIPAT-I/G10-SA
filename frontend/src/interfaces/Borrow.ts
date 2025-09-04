// 📚 Interfaces สำหรับระบบยืมหนังสือ
// อ้างอิงจาก backend entities: borrow.go, book_license.go, book_status.go

// ======= Borrow System Interfaces =======

// 📖 สถานะของหนังสือ (Available, Borrowed, Hold)
export interface BookStatus {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string;
  status_name: string; // "Available", "Borrowed", "Hold"
  book_licenses?: BookLicense[];
}

// 📄 License ของหนังสือแต่ละเล่ม (คล้าย copy ของหนังสือ)
export interface BookLicense {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string;
  book_license_id: string; // รหัสเฉพาะของเล่มนี้
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
  book_status_id: number;
  book_status?: BookStatus;
  borrows?: Borrow[];
}

// 📅 การยืมหนังสือ
export interface Borrow {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string;
  borrow_date: string; // วันที่ยืม
  due_date: string; // วันที่ครบกำหนดคืน
  return_date?: string; // วันที่คืนจริง (null ถ้ายังไม่คืน)
  user_id: string;
  user?: {
    UserID: string;
    FirstName: string;
    LastName: string;
    Email: string;
  };
  book_license_id: number;
  book_license?: BookLicense;
  reading_activities?: Array<{
    ID: number;
    activity_date: string;
    page_read: number;
  }>;
  notifications?: Array<{
    ID: number;
    message: string;
    sent_date: string;
  }>;
}

// ======= Form Interfaces =======

// 📝 ฟอร์มสำหรับยืมหนังสือ
export interface BorrowRequest {
  book_id: number;
  user_id: string;
  borrow_date?: string; // ถ้าไม่ระบุจะใช้วันปัจจุบัน
  due_date?: string; // ถ้าไม่ระบุจะคำนวณจากกฎของห้องสมุด
}

// 📝 ฟอร์มสำหรับคืนหนังสือ
export interface ReturnRequest {
  borrow_id: number;
  return_date?: string; // ถ้าไม่ระบุจะใช้วันปัจจุบัน
}

// ======= Response Interfaces =======

// 📊 ข้อมูลการยืมพร้อมรายละเอียด
export interface BorrowWithDetails extends Borrow {
  // เพิ่มข้อมูลที่คำนวณได้
  is_overdue: boolean; // เกินกำหนดหรือไม่
  days_overdue: number; // จำนวนวันที่เกินกำหนด
  days_until_due: number; // จำนวนวันก่อนครบกำหนด
  can_renew: boolean; // สามารถต่ออายุได้หรือไม่
  fine_amount?: number; // ค่าปรับ (ถ้ามี)
}

// 📋 รายการการยืมของผู้ใช้
export interface UserBorrowsResponse {
  current_borrows: BorrowWithDetails[]; // หนังสือที่ยืมอยู่
  borrow_history: BorrowWithDetails[]; // ประวัติการยืม
  overdue_count: number; // จำนวนหนังสือที่เกินกำหนด
  total_fine: number; // ค่าปรับรวม
}

// 📈 สถิติการยืม
export interface BorrowStatistics {
  total_borrows: number;
  active_borrows: number;
  overdue_borrows: number;
  returned_this_month: number;
  popular_books: Array<{
    book_id: number;
    title: string;
    borrow_count: number;
  }>;
}

// ======= Error Interfaces =======

// ⚠️ ข้อผิดพลาดในการยืม
export interface BorrowError {
  code: string;
  message: string;
  details?: {
    book_id?: number;
    user_id?: string;
    available_date?: string; // วันที่หนังสือจะว่าง
    queue_position?: number; // ลำดับในคิวรอ
  };
}

// ======= Utility Types =======

// 🔍 ตัวกรองการยืม
export interface BorrowFilter {
  user_id?: string;
  book_id?: number;
  status?: 'active' | 'returned' | 'overdue' | 'all';
  date_from?: string;
  date_to?: string;
  sort_by?: 'borrow_date' | 'due_date' | 'return_date';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// 📄 การแบ่งหน้า
export interface PaginatedBorrowResponse {
  data: BorrowWithDetails[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}
