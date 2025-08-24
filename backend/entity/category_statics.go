package entity

import (
    "time"
    "gorm.io/gorm"
)

type CategoryStatics struct {
    gorm.Model
    BookCount  int       `json:"book_count"`
    LastUpdate time.Time `json:"last_update"`

    // back-reference: บอกว่า FK อยู่ที่ Category.CategoryStaticsID
    Category *Category `gorm:"foreignKey:CategoryStaticsID" json:"category"`
}