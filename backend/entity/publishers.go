package entity

import "gorm.io/gorm"

type Publishers struct {
	gorm.Model
	PublisherName string   `gorm:"not null" json:"publisher_name"`
	Book         []Book `gorm:"foreignKey:PublisherID" json:"book"`
}
