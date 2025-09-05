package entity

import (
	"gorm.io/gorm"
)

type BorrowPolicy struct {
	gorm.Model
	RoleID		uint   `gorm:"not null" json:"role_id"`
	Role		*Role

	MaxBorrowDay uint   `gorm:"not null" json:"max_borrow_day"`
	MaxBorrowBook uint   `gorm:"not null" json:"max_borrow_book"`
	HoldHour    uint   `gorm:"not null" json:"hold_hour"`

	
	Borrow    	[]Borrow `gorm:"foreignKey:BorrowPolicyID" json:"borrows"`
}
