package entity

import "gorm.io/gorm"

type Languages struct {
	gorm.Model
	Name  string   `gorm:"uniqueIndex;not null" json:"name"`
	Books []Book `gorm:"foreignKey:LanguageID" json:"book"`
}
