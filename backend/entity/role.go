package entity

import (
	"gorm.io/gorm"
)

type Role struct {
	gorm.Model
	Name  string `gorm:"unique;not null" json:"name"`
	Users []User `gorm:"foreignKey:RoleID" json:"users"`
	BorrowPolicy   []BorrowPolicy `gorm:"foreignKey:RoleID" json:"borrow_policy"`
}
