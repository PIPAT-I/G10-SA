package entity

import (
	"time"

	"gorm.io/gorm"
)

type Reservation struct {
    gorm.Model
    ReservationDate     time.Time          `json:"reservation_date"`
    UserID              string             `gorm:"not null" json:"user_id"`
    User                *User              `gorm:"foreignKey:UserID;references:UserID" json:"user"`
    ReservationStatusID uint               `gorm:"not null" json:"reservation_status_id"`
    ReservationStatus   *ReservationStatus `gorm:"foreignKey:ReservationStatusID" json:"reservation_status"`
    BookID              uint               `gorm:"not null" json:"book_id"`
    Book                *Book              `gorm:"foreignKey:BookID;references:ID" json:"book"`
    // Allocation info when user is notified and a specific license is held
    AllocatedBookLicenseID *uint         `json:"allocated_book_license_id"`
    AllocatedBookLicense   *BookLicense  `gorm:"foreignKey:AllocatedBookLicenseID" json:"allocated_book_license"`
    NotifiedAt             *time.Time    `json:"notified_at"`
    ExpiresAt              *time.Time    `json:"expires_at"`
}
