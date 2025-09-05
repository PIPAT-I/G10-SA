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
    // Borrow now ties to a specific license (copy) of a book
    BookLicenseID uint         `gorm:"not null" json:"book_license_id"`
    BookLicense   *BookLicense `gorm:"foreignKey:BookLicenseID;references:ID" json:"book_license"`
    // Relationships
    BorrowPolicyID   uint             `gorm:"not null" json:"borrow_policy_id"`
    BorrowPolicy     *BorrowPolicy    `gorm:"foreignKey:BorrowPolicyID" json:"borrow_policy"`

    
    ReadingActivities []ReadingActivity `gorm:"foreignKey:BorrowID" json:"reading_activities"`
}
