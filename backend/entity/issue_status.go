package entity

import (
	"gorm.io/gorm"
)

type IssueStatus struct {
	gorm.Model
	StatusName string  `gorm:"not null" json:"status_name"`
	Issues     []Issue `gorm:"foreignKey:IssueStatusID" json:"issues"`
}
