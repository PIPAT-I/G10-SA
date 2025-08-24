package entity

import (
	"gorm.io/gorm"
)

type Profile struct {
	gorm.Model
	AvatarURL string `gorm:"type:text" json:"avatar_url"`
	UserID    string `gorm:"not null;uniqueIndex" json:"user_id"`
	User      User   `gorm:"foreignKey:UserID;references:UserID" json:"user"`
}
