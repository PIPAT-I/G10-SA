package entity

import(
	"gorm.io/gorm"
)

type ReviewVoteType struct {
	gorm.Model
	Name string `gorm:"not null" json:"name"`	
}