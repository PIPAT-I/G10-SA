package entity

import (
	"time"

	"gorm.io/gorm"
)

type Reservation struct {
	gorm.Model
	ReservationDate     time.Time          `json:"reservation_date"`
	UserID              string             `gorm:"not null" json:"user_id"`
	User                *User              `gorm:"foreignKey:UserID;references:UserID" json:"user"`
	BookID              uint               `gorm:"not null" json:"book_id"`
	Book                *Book              `gorm:"foreignKey:BookID" json:"book"`
	ReservationStatusID uint               `gorm:"not null" json:"reservation_status_id"`
	ReservationStatus   *ReservationStatus `gorm:"foreignKey:ReservationStatusID" json:"reservation_status"`
}
