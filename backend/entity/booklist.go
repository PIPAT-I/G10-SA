package entity

import (
	"gorm.io/gorm"
)

type Booklist struct {
	gorm.Model
	UserID string `gorm:"not null" json:"user_id"`
	User   User   `gorm:"foreignKey:UserID;references:UserID" json:"user"`
	Title  string `gorm:"not null" json:"title"`
	Books  []Book `gorm:"many2many:booklist_books;" json:"books"`
}