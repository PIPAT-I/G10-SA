package entity

import "gorm.io/gorm"

type FileTypes struct {
	gorm.Model
	TypeName string   `gorm:"not null" json:"type_name"`
	Books    []Book `gorm:"foreignKey:FileTypeID" json:"books"`
}
