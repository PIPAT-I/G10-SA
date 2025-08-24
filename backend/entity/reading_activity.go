package entity

import (
	"time"

	"gorm.io/gorm"
)

type ReadingActivity struct {
	gorm.Model
	CurrentPage     int       `gorm:"not null" json:"current_page"`
	StartTime       time.Time `gorm:"not null" json:"start_time"`
	EndTime         time.Time `json:"end_time"`
	ReadingDuration float64   `json:"reading_duration"`
	Note            string    `gorm:"type:text" json:"note"`

	// BorrowID ทำหน้าที่เป็น FK
	BorrowID uint   `gorm:"not null" json:"borrow_id"`
	Borrow   Borrow `gorm:"foreignKey:BorrowID" json:"borrow"`

	// UserID ทำหน้าที่เป็น FK (ใช้ string เพื่อให้ตรงกับ User.UserID)
	UserID string `gorm:"not null" json:"user_id"`
	User   User   `gorm:"foreignKey:UserID;references:UserID" json:"user"`

	// BookID ทำหน้าที่เป็น FK
	BookID uint `gorm:"not null" json:"book_id"`
	Book   Book `gorm:"foreignKey:BookID" json:"book"`
}
