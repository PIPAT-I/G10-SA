package entity

import (
	"gorm.io/gorm"
)

type BookStatus struct {
	gorm.Model
	StatusName string `gorm:"not null" json:"status_name"`
	BookLicenses []BookLicense `gorm:"foreignKey:BookStatusID" json:"book_licenses"`
}