package entity

import (
	"gorm.io/gorm"
)

type FileAttachment struct {
	gorm.Model
	FileName       string       `gorm:"not null" json:"file_name"`
	FilePath       string       `gorm:"not null" json:"file_path"`
	FileType       string       `gorm:"not null" json:"file_type"`
	AnnouncementID *uint        `json:"announcement_id"`
	Announcement   Announcement `gorm:"foreignKey:AnnouncementID" json:"announcement"`
}
