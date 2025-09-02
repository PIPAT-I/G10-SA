package entity

import (
	"gorm.io/gorm"
)

type Review struct {
	gorm.Model
	Rating  uint   `json:"rating"`
	Comment string `gorm:"type:text" json:"comment"`

	BookID uint `gorm:"not null" json:"book_id"`
	Book   Book `gorm:"foreignKey:BookID" json:"book"`

	UserID string `gorm:"not null" json:"user_id"`
	User   User   `gorm:"foreignKey:UserID;references:UserID" json:"user"`


}
