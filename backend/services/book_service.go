package services

import (
	"errors"
	"fmt"

	"github.com/PIPAT-I/G10-SA/entity"
	"gorm.io/gorm"
)

type BookService struct {
	DB *gorm.DB
}

// 📚 สร้างหนังสือใหม่
func (s *BookService) CreateBook(book *entity.Book) error {
	// ตรวจสอบ ISBN ซ้ำ
	var existingBook entity.Book
	if err := s.DB.Where("isbn = ?", book.Isbn).First(&existingBook).Error; err == nil {
		return errors.New("ISBN นี้มีอยู่ในระบบแล้ว")
	}

	// บันทึกหนังสือ
	if err := s.DB.Create(book).Error; err != nil {
		return fmt.Errorf("ไม่สามารถสร้างหนังสือได้: %v", err)
	}

	return nil
}

// 📖 ดึงหนังสือทั้งหมด
func (s *BookService) GetAllBooks(page, limit int) ([]entity.Book, int64, error) {
	var books []entity.Book
	var total int64

	// นับจำนวนทั้งหมด
	s.DB.Model(&entity.Book{}).Count(&total)

	// คำนวณ offset
	offset := (page - 1) * limit

	// ดึงข้อมูลพร้อม relations
	err := s.DB.Preload("Publisher").
		Preload("Language").
		Preload("FileType").
		Preload("User").
		Preload("Categories").
		Preload("Authors").
		Preload("BookLicenses").
		Offset(offset).
		Limit(limit).
		Find(&books).Error

	if err != nil {
		return nil, 0, fmt.Errorf("ไม่สามารถดึงข้อมูลหนังสือได้: %v", err)
	}

	return books, total, nil
}

// 🔍 ดึงหนังสือตาม ID
func (s *BookService) GetBookByID(id uint) (*entity.Book, error) {
	var book entity.Book

	err := s.DB.Preload("Publisher").
		Preload("Language").
		Preload("FileType").
		Preload("User").
		Preload("Categories").
		Preload("Authors").
		Preload("BookLicenses").
		Preload("Reviews").
		First(&book, id).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบหนังสือที่ต้องการ")
		}
		return nil, fmt.Errorf("ไม่สามารถดึงข้อมูลหนังสือได้: %v", err)
	}

	return &book, nil
}

// ✏️ อัปเดตหนังสือ
func (s *BookService) UpdateBook(id uint, updateData *entity.Book) error {
	var book entity.Book

	// ตรวจสอบว่าหนังสือมีอยู่หรือไม่
	if err := s.DB.First(&book, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("ไม่พบหนังสือที่ต้องการแก้ไข")
		}
		return fmt.Errorf("ไม่สามารถค้นหาหนังสือได้: %v", err)
	}

	// ตรวจสอบ ISBN ซ้ำ (ถ้ามีการเปลี่ยน)
	if updateData.Isbn != "" && updateData.Isbn != book.Isbn {
		var existingBook entity.Book
		if err := s.DB.Where("isbn = ? AND id != ?", updateData.Isbn, id).First(&existingBook).Error; err == nil {
			return errors.New("ISBN นี้มีอยู่ในระบบแล้ว")
		}
	}

	// อัปเดตข้อมูล
	if err := s.DB.Model(&book).Updates(updateData).Error; err != nil {
		return fmt.Errorf("ไม่สามารถอัปเดตหนังสือได้: %v", err)
	}

	return nil
}

// 🗑️ ลบหนังสือ
func (s *BookService) DeleteBook(id uint) error {
	var book entity.Book

	// ตรวจสอบว่าหนังสือมีอยู่หรือไม่
	if err := s.DB.First(&book, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("ไม่พบหนังสือที่ต้องการลบ")
		}
		return fmt.Errorf("ไม่สามารถค้นหาหนังสือได้: %v", err)
	}

	// ตรวจสอบว่ามีการยืมหรือจองอยู่หรือไม่
	var borrowCount int64
	s.DB.Model(&entity.Borrow{}).
		Joins("JOIN book_licenses ON borrows.book_license_id = book_licenses.id").
		Where("book_licenses.book_id = ? AND borrows.return_date IS NULL", id).
		Count(&borrowCount)

	if borrowCount > 0 {
		return errors.New("ไม่สามารถลบหนังสือได้ เนื่องจากมีการยืมอยู่")
	}

	var reservationCount int64
	s.DB.Model(&entity.Reservation{}).
		Where("book_id = ? AND reservation_status_id IN (1, 2)", id). // Waiting, Notified
		Count(&reservationCount)

	if reservationCount > 0 {
		return errors.New("ไม่สามารถลบหนังสือได้ เนื่องจากมีการจองอยู่")
	}

	// ลบหนังสือ (soft delete)
	if err := s.DB.Delete(&book).Error; err != nil {
		return fmt.Errorf("ไม่สามารถลบหนังสือได้: %v", err)
	}

	return nil
}

// 🔍 ค้นหาหนังสือ
func (s *BookService) SearchBooks(query string, page, limit int) ([]entity.Book, int64, error) {
	var books []entity.Book
	var total int64

	// สร้าง query สำหรับค้นหา
	searchQuery := s.DB.Model(&entity.Book{}).
		Joins("LEFT JOIN publishers ON books.publisher_id = publishers.id").
		Joins("LEFT JOIN book_author ON books.id = book_author.book_id").
		Joins("LEFT JOIN authors ON book_author.author_id = authors.id").
		Where("books.title LIKE ? OR books.isbn LIKE ? OR publishers.name LIKE ? OR authors.name LIKE ?",
			"%"+query+"%", "%"+query+"%", "%"+query+"%", "%"+query+"%").
		Group("books.id")

	// นับจำนวนทั้งหมด
	searchQuery.Count(&total)

	// คำนวณ offset
	offset := (page - 1) * limit

	// ดึงข้อมูล
	err := searchQuery.Preload("Publisher").
		Preload("Language").
		Preload("FileType").
		Preload("User").
		Preload("Categories").
		Preload("Authors").
		Preload("BookLicenses").
		Offset(offset).
		Limit(limit).
		Find(&books).Error

	if err != nil {
		return nil, 0, fmt.Errorf("ไม่สามารถค้นหาหนังสือได้: %v", err)
	}

	return books, total, nil
}

// 📊 ดึงสถิติหนังสือ
func (s *BookService) GetBookStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// จำนวนหนังสือทั้งหมด
	var totalBooks int64
	s.DB.Model(&entity.Book{}).Count(&totalBooks)
	stats["total_books"] = totalBooks

	// จำนวน License ทั้งหมด
	var totalLicenses int64
	s.DB.Model(&entity.BookLicense{}).Count(&totalLicenses)
	stats["total_licenses"] = totalLicenses

	// จำนวนหนังสือที่ถูกยืม
	var borrowedLicenses int64
	s.DB.Model(&entity.BookLicense{}).Where("book_status_id = 2").Count(&borrowedLicenses) // Borrowed
	stats["borrowed_licenses"] = borrowedLicenses

	// จำนวนหนังสือที่ว่าง
	availableLicenses := totalLicenses - borrowedLicenses
	stats["available_licenses"] = availableLicenses

	return stats, nil
}
