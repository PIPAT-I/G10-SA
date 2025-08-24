package entity

import(
	"gorm.io/gorm"
)

type NotificationType struct {
	gorm.Model
	TypeName        string        `gorm:"not null" json:"type_name"`
	Description     string        `gorm:"type:text" json:"description"`
	Notifications   []Notification `gorm:"foreignKey:NotificationTypeID" json:"notifications"`
}
