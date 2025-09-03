export interface ReadingActivity {
  ID: number;
  user_id?: number;
  book_id?: number;
  book_license_id?: number;

  progress?: number;   // เปอร์เซ็นต์
  last_page?: number;  // หน้าสุดท้ายที่อ่าน
  note?: string;
}

export interface FindReadingActivitiesQuery {
  user_id?: number;
  book_id?: number;
  book_license_id?: number;
}