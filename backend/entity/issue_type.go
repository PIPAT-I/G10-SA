package entity

import (
	"gorm.io/gorm"
)

type IssueType struct {
	gorm.Model
	TypeName string  `gorm:"not null" json:"type_name"`
	Issues   []Issue `gorm:"foreignKey:IssueTypeID" json:"issues"`
}
