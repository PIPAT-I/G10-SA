package entity

import (
	"time"

	"gorm.io/gorm"
)

type Announcement_Read struct {
	gorm.Model
	AnnouncementID *uint        `json:"announcement_id"`
	Announcement   Announcement `gorm:"foreignKey:AnnouncementID" json:"announcement"`
	UserID         *string      `json:"user_id"`
	User           User         `gorm:"foreignKey:UserID;references:UserID" json:"user"`
	ReadAt         time.Time    `json:"read_at"`
}
