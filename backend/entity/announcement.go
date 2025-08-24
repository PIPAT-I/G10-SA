package entity

import (
	"time"

	"gorm.io/gorm"
)

type Announcement struct {
	gorm.Model
	Title   string    `gorm:"not null" json:"title"`
	Content string    `gorm:"type:text" json:"content"`
	Status  string    `gorm:"not null" json:"status"`
	Date    time.Time `json:"date"`

	CreateBy *string `json:"create_by"`
	User     User    `gorm:"foreignKey:CreateBy;references:UserID" json:"user"`
	Books    []Book  `gorm:"many2many:announcement_books;" json:"books"`

	AnnouncementCategoryID *uint                `json:"announcement_category_id"`
	AnnouncementCategory   AnnouncementCategory `gorm:"foreignKey:AnnouncementCategoryID" json:"announcement_category"`

	Announcement_Reads []Announcement_Read `gorm:"foreignKey:AnnouncementID;references:ID" json:"announcement_reads"`
	Attachments        []FileAttachment    `gorm:"foreignKey:AnnouncementID;references:ID" json:"attachments"`
}
