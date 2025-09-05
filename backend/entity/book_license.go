package entity

import (
	"gorm.io/gorm"
)

type BookLicense struct {
    gorm.Model
    BookID        uint        `gorm:"not null" json:"book_id"`
    Book          *Book       `gorm:"foreignKey:BookID" json:"book"`
    BookStatusID  uint        `gorm:"not null" json:"book_status_id"`
    BookStatus    *BookStatus `gorm:"foreignKey:BookStatusID" json:"book_status"`

    // Back-reference for borrows of this specific license
    Borrows        []Borrow   `gorm:"foreignKey:BookLicenseID" json:"borrows"`
    Reservations   []Reservation `gorm:"foreignKey:AllocatedBookLicenseID" json:"reservations"`
}
