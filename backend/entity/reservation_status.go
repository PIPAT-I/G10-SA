package entity

import (
	"gorm.io/gorm"
)

type ReservationStatus struct {
	gorm.Model
	StatusName string `gorm:"not null" json:"status_name"`
	Reservations []Reservation `gorm:"foreignKey:ReservationStatusID" json:"reservations"`
}
