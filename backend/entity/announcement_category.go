package entity

import (
	"gorm.io/gorm"
)

type AnnouncementCategory struct {
	gorm.Model
	CategoryName  string         `gorm:"not null" json:"category_name"`
	Announcements []Announcement `gorm:"foreignKey:AnnouncementCategoryID" json:"announcements"`
}
