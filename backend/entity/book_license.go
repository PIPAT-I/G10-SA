package entity

import (
	"gorm.io/gorm"
)

type BookLicense struct {
	gorm.Model
	BookLicenseID string      `gorm:"unique;not null" json:"book_license_id"`
	BookID        uint        `gorm:"not null" json:"book_id"`
	Book          *Book       `gorm:"foreignKey:BookID" json:"book"`
	BookStatusID  uint        `gorm:"not null" json:"book_status_id"`
	BookStatus    *BookStatus `gorm:"foreignKey:BookStatusID" json:"book_status"`
}
