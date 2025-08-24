package entity

import "gorm.io/gorm"

type Notification struct {
	gorm.Model
	Title   string `gorm:"not null" json:"title"`
	Message string `gorm:"type:text" json:"message"`
	Type    string `gorm:"not null" json:"type"`
	IsRead  bool   `gorm:"default:false" json:"is_read"`

	ReservationID *uint       `json:"reservation_id"`
	Reservation   Reservation `gorm:"foreignKey:ReservationID" json:"reservation"`

	NotificationTypeID *uint          `json:"notification_type_id"`
	NotificationType   NotificationType `gorm:"foreignKey:NotificationTypeID" json:"notification_type"`

	BookID *uint `json:"book_id"`
	Book   Book  `gorm:"foreignKey:BookID" json:"book"`

	UserID *string `json:"user_id"`
	User   User    `gorm:"foreignKey:UserID;references:UserID" json:"user"`

	BorrowID *uint       `json:"borrow_id"`
	Borrow   Borrow      `gorm:"foreignKey:BorrowID" json:"borrow"`
}
