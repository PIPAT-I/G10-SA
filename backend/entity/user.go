package entity

import (
	"time"
	
)

type User struct {
	UserID      string `gorm:"not null;primaryKey" json:"user_id"`
	Password    string `gorm:"not null" json:"-"`
	Firstname   string `gorm:"not null" json:"firstname"`
	Lastname    string `gorm:"not null" json:"lastname"`
	Email       string `gorm:"unique;not null" json:"email"`
	PhoneNumber string `gorm:"not null" json:"phone_number"`

	
	RoleID          uint            `gorm:"not null" json:"role_id"`
	Role			*Role            `gorm:"foreignKey:RoleID" json:"role"`
	Profile		*Profile         `gorm:"foreignKey:UserID;references:UserID" json:"profile"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`

	// Relationships
	Borrows           []Borrow          `gorm:"foreignKey:UserID;references:UserID" json:"borrows"`
	ReadingActivities []ReadingActivity `gorm:"foreignKey:UserID;references:UserID" json:"reading_activities"`
	Reservations      []Reservation     `gorm:"foreignKey:UserID;references:UserID" json:"reservations"`
	Books             []Book             `gorm:"foreignKey:UserID;references:UserID" json:"book"`
	Reviews           []Review          `gorm:"foreignKey:UserID;references:UserID" json:"reviews"`
	Booklists        []Booklist       	`gorm:"foreignKey:UserID;references:UserID" json:"booklists"`
	Issues            []Issue           `gorm:"foreignKey:UserID;references:UserID" json:"issues"`
	Category		 []Category        `gorm:"foreignKey:UserID;references:UserID" json:"category"`

}