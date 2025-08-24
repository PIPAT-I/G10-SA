package entity

import (
	"time"

	"gorm.io/gorm"
)

type Borrow struct {
	gorm.Model
	BorrowDate time.Time  `json:"borrow_date"`
	DueDate    time.Time  `json:"due_date"`
	ReturnDate *time.Time `json:"return_date"`
	UserID     string     `gorm:"not null" json:"user_id"`
	User       *User      `gorm:"foreignKey:UserID;references:UserID" json:"user"`
	BookID     uint       `gorm:"not null" json:"book_id"`
	Book       *Book      `gorm:"foreignKey:BookID;references:ID" json:"book"`

	// Relationships
	ReadingActivities []ReadingActivity `gorm:"foreignKey:BorrowID" json:"reading_activities"`
	Reviews           []Review          `gorm:"foreignKey:BorrowID" json:"reviews"`
	Notifications     []Notification    `gorm:"foreignKey:BorrowID" json:"notifications"`
}
