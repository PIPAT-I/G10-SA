package entity

import "gorm.io/gorm"

type BorrowingLimit struct {
	gorm.Model
	LimitNumber uint `json:"limit_number"`
	User        []User `gorm:"foreignKey:BorrowingLimitID" json:"user"`
	
}