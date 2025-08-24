package entity

import (
	"gorm.io/gorm")

type ReviewReply struct {
	gorm.Model
	Comment    string `gorm:"not null" json:"comment"`

	ReviewID     uint
	Review       Review `gorm:"foreignKey:ReviewID" json:"review"`

	UserID     string
	User       User `gorm:"foreignKey:UserID;references:UserID" json:"user"`

}