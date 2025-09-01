package entity

import (
)

type BooklistBooks struct {
	ID         uint `gorm:"primaryKey"`
	BooklistID uint `gorm:"not null"`
	BookID     uint `gorm:"not null"`
}
