package entity

import "gorm.io/gorm"

type Author struct {
	gorm.Model
	AuthorName string   `gorm:"not null" json:"author_name"`
	Book      []Book `gorm:"many2many:book_author;" json:"book"`
}
